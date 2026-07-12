import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

const SQUARE_API = "https://connect.squareup.com/v2";
const LOCATION_ID = "L4TWM1M1RC52V";

export type AdminUser = {
  id: number;
  auth0_id: string | null;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
  last_login_at: string | null;
  square_customer_id: string | null;
  order_count: number;
  is_admin: number;
};

export type AdminUserOrder = {
  id: string;
  createdAt: string;
  state: string;
  totalMoney: { amount: number; currency: string };
  lineItems: Array<{ name: string; quantity: string; totalMoney: { amount: number; currency: string } }>;
};

export const adminGetAllUsers = createServerFn().handler(async (): Promise<AdminUser[]> => {
  await requireAdmin();
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT u.id, u.auth0_id, u.email, u.name, u.picture,
              u.created_at, u.last_login_at, u.square_customer_id,
              COUNT(DISTINCT uo.order_id) AS order_count,
              CASE WHEN a.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_admin
       FROM users u
       LEFT JOIN user_orders uo ON uo.user_id = u.id
       LEFT JOIN admins a ON a.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all<AdminUser>();
  return results;
});

export const adminGetOrdersForUser = createServerFn().handler(
  async ({ data }: { data: { userId: number; email: string } }): Promise<AdminUserOrder[]> => {
    await requireAdmin();
    const e = env as Cloudflare.Env;
    const h = {
      Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2025-01-23",
    };

    const storedRows = await e.DB
      .prepare("SELECT order_id FROM user_orders WHERE user_id = ?")
      .bind(data.userId)
      .all<{ order_id: string }>();
    const storedOrderIds = storedRows.results.map((r) => r.order_id);

    const userRow = await e.DB
      .prepare("SELECT square_customer_id FROM users WHERE id = ?")
      .bind(data.userId)
      .first<{ square_customer_id: string | null }>();

    const allOrders: AdminUserOrder[] = [];
    const seenIds = new Set<string>();

    if (storedOrderIds.length > 0) {
      const batchRes = await fetch(`${SQUARE_API}/orders/batch-retrieve`, {
        method: "POST", headers: h,
        body: JSON.stringify({ order_ids: storedOrderIds }),
      });
      const batchJson = await batchRes.json() as { orders?: any[] };
      for (const o of batchJson.orders ?? []) {
        allOrders.push(mapOrder(o));
        seenIds.add(o.id);
      }
    }

    let customerIds: string[] = [];
    if (userRow?.square_customer_id) {
      customerIds = [userRow.square_customer_id];
    } else {
      const custRes = await fetch(`${SQUARE_API}/customers/search`, {
        method: "POST", headers: h,
        body: JSON.stringify({ query: { filter: { email_address: { exact: data.email } } } }),
      });
      const custJson = await custRes.json() as { customers?: any[] };
      customerIds = (custJson.customers ?? []).map((c: any) => c.id);
    }

    if (customerIds.length > 0) {
      const ordersRes = await fetch(`${SQUARE_API}/orders/search`, {
        method: "POST", headers: h,
        body: JSON.stringify({
          location_ids: [LOCATION_ID],
          query: {
            filter: { customer_filter: { customer_ids: customerIds } },
            sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
          },
        }),
      });
      const ordersJson = await ordersRes.json() as { orders?: any[] };
      for (const o of ordersJson.orders ?? []) {
        if (!seenIds.has(o.id)) {
          allOrders.push(mapOrder(o));
          seenIds.add(o.id);
        }
      }
    }

    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

function mapOrder(o: any): AdminUserOrder {
  return {
    id: o.id,
    createdAt: o.created_at,
    state: o.state ?? "COMPLETED",
    totalMoney: o.total_money ?? { amount: 0, currency: "USD" },
    lineItems: (o.line_items ?? []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.total_money ?? { amount: 0, currency: "USD" },
    })),
  };
}
