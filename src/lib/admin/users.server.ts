import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

const SQUARE_API = "https://connect.squareup.com/v2";

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
  refundedAmount: number;
  lineItems: Array<{ name: string; quantity: string; totalMoney: { amount: number; currency: string } }>;
};

export type AdminUsersPayload = {
  users: AdminUser[];
  squareOrderCount: number;
};

export const adminGetAllUsers = createServerFn().handler(async (): Promise<AdminUsersPayload> => {
  await requireAdmin();
  const e = env as Cloudflare.Env;
  const db = e.DB;

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

  // Count Square orders across all locations for all registered users.
  // We use the same email→customer ID lookup the per-user modal uses.
  const h = {
    Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-01-23",
  };

  // Resolve Square customer IDs: use stored one if available, otherwise search by email
  const customerIdSets = await Promise.all(
    results.map(async (u) => {
      if (u.square_customer_id) return [u.square_customer_id];
      const res = await fetch(`${SQUARE_API}/customers/search`, {
        method: "POST", headers: h,
        body: JSON.stringify({ query: { filter: { email_address: { exact: u.email } } } }),
      });
      const json = await res.json() as { customers?: Array<{ id: string }> };
      return (json.customers ?? []).map((c) => c.id);
    })
  );
  const allCustomerIds = [...new Set(customerIdSets.flat())];

  // Fetch all active location IDs once
  const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
  const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
  const locationIds = (locJson.locations ?? [])
    .filter((l) => l.status === "ACTIVE")
    .map((l) => l.id);

  let squareOrderCount = 0;
  if (allCustomerIds.length > 0 && locationIds.length > 0) {
    let cursor: string | undefined;
    do {
      const body: Record<string, unknown> = {
        location_ids: locationIds,
        limit: 500,
        query: { filter: { customer_filter: { customer_ids: allCustomerIds } } },
      };
      if (cursor) body.cursor = cursor;
      const res = await fetch(`${SQUARE_API}/orders/search`, {
        method: "POST", headers: h, body: JSON.stringify(body),
      });
      const json = await res.json() as { orders?: unknown[]; cursor?: string };
      squareOrderCount += (json.orders ?? []).length;
      cursor = json.cursor;
    } while (cursor);
  }

  return { users: results, squareOrderCount };
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
      // Fetch all active location IDs so in-person Square orders are included
      const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
      const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
      const locationIds = (locJson.locations ?? [])
        .filter((l) => l.status === "ACTIVE")
        .map((l) => l.id);

      if (locationIds.length > 0) {
        const ordersRes = await fetch(`${SQUARE_API}/orders/search`, {
          method: "POST", headers: h,
          body: JSON.stringify({
            location_ids: locationIds,
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
    }

    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

function mapOrder(o: any): AdminUserOrder {
  const completedRefunds = (o.refunds ?? []).filter((r: any) => r.state === "COMPLETED");
  const refundedAmount = completedRefunds.reduce(
    (sum: number, r: any) => sum + (r.amount_money?.amount ?? 0), 0
  );
  return {
    id: o.id,
    createdAt: o.created_at,
    state: o.state ?? "COMPLETED",
    totalMoney: o.total_money ?? { amount: 0, currency: "USD" },
    refundedAmount,
    lineItems: (o.line_items ?? []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.total_money ?? { amount: 0, currency: "USD" },
    })),
  };
}
