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
  isRefunded: boolean;
  totalMoney: { amount: number; currency: string };
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

  const h = {
    Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-01-23",
  };

  // Resolve Square customer IDs sequentially to avoid hitting Cloudflare's
  // concurrent outbound connection limit. Cache discovered IDs back to DB.
  const allCustomerIds: string[] = [];
  for (const u of results) {
    if (u.square_customer_id) {
      allCustomerIds.push(u.square_customer_id);
      continue;
    }
    try {
      const res = await fetch(`${SQUARE_API}/customers/search`, {
        method: "POST", headers: h,
        body: JSON.stringify({ query: { filter: { email_address: { exact: u.email } } } }),
      });
      const json = await res.json() as { customers?: Array<{ id: string }> };
      const ids = (json.customers ?? []).map((c) => c.id);
      if (ids.length > 0) {
        allCustomerIds.push(ids[0]);
        // Persist so future page loads skip this lookup
        await db
          .prepare("UPDATE users SET square_customer_id = ? WHERE id = ?")
          .bind(ids[0], u.id)
          .run();
      }
    } catch {
      // Non-fatal — skip this user
    }
  }

  const uniqueCustomerIds = [...new Set(allCustomerIds)];

  // Fetch all active location IDs
  const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
  const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
  const locationIds = (locJson.locations ?? [])
    .filter((l) => l.status === "ACTIVE")
    .map((l) => l.id);

  let squareOrderCount = 0;
  if (uniqueCustomerIds.length > 0 && locationIds.length > 0) {
    let cursor: string | undefined;
    do {
      const body: Record<string, unknown> = {
        location_ids: locationIds,
        limit: 500,
        query: { filter: { customer_filter: { customer_ids: uniqueCustomerIds } } },
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
      // Cache the discovered customer ID
      if (customerIds.length > 0) {
        await e.DB
          .prepare("UPDATE users SET square_customer_id = ? WHERE id = ?")
          .bind(customerIds[0], data.userId)
          .run();
      }
    }

    if (customerIds.length > 0) {
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
  // A refunded shipment order has its fulfillment canceled — same signal
  // the public order history page uses. net_amounts does not reflect refunds.
  const fulfillmentState: string = o.fulfillments?.[0]?.state ?? "";
  const isRefunded = fulfillmentState === "CANCELED";
  return {
    id: o.id,
    createdAt: o.created_at,
    state: o.state ?? "COMPLETED",
    isRefunded,
    totalMoney: o.total_money ?? { amount: 0, currency: "USD" },
    lineItems: (o.line_items ?? []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.total_money ?? { amount: 0, currency: "USD" },
    })),
  };
}
