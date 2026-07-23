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

  const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
  const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
  const locationIds = (locJson.locations ?? [])
    .filter((l) => l.status === "ACTIVE")
    .map((l) => l.id);

  // Count all SHIPMENT/PICKUP orders — the same set the orders page shows
  let squareOrderCount = 0;
  if (locationIds.length > 0) {
    let cursor: string | undefined;
    do {
      const body: Record<string, unknown> = {
        location_ids: locationIds,
        limit: 500,
        query: {
          filter: {
            fulfillment_filter: { fulfillment_types: ["SHIPMENT", "PICKUP"] },
            state_filter: { states: ["OPEN", "COMPLETED", "CANCELED"] },
            date_time_filter: { created_at: { start_at: "2020-01-01T00:00:00Z" } },
          },
        },
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

    const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
    const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
    const locationIds = (locJson.locations ?? [])
      .filter((l) => l.status === "ACTIVE")
      .map((l) => l.id);

    if (locationIds.length === 0) return [];

    // Search all SHIPMENT/PICKUP orders and filter by recipient email
    const allOrders: AdminUserOrder[] = [];
    const targetEmail = data.email.toLowerCase();

    let cursor: string | undefined;
    do {
      const body: Record<string, unknown> = {
        location_ids: locationIds,
        limit: 500,
        query: {
          filter: {
            fulfillment_filter: { fulfillment_types: ["SHIPMENT", "PICKUP"] },
            state_filter: { states: ["OPEN", "COMPLETED", "CANCELED"] },
            date_time_filter: { created_at: { start_at: "2020-01-01T00:00:00Z" } },
          },
          sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
        },
      };
      if (cursor) body.cursor = cursor;

      const res = await fetch(`${SQUARE_API}/orders/search`, {
        method: "POST", headers: h, body: JSON.stringify(body),
      });
      const json = await res.json() as { orders?: any[]; cursor?: string };

      for (const o of json.orders ?? []) {
        const fulfillment = o.fulfillments?.[0];
        const recipient =
          fulfillment?.shipment_details?.recipient ??
          fulfillment?.pickup_details?.recipient;
        const recipientEmail = (recipient?.email_address ?? "").toLowerCase();
        if (recipientEmail !== targetEmail) continue;

        allOrders.push({
          id: o.id,
          createdAt: o.created_at,
          state: o.state ?? "OPEN",
          isRefunded: fulfillment?.state === "CANCELED",
          totalMoney: o.total_money ?? { amount: 0, currency: "USD" },
          lineItems: (o.line_items ?? []).map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            totalMoney: item.total_money ?? { amount: 0, currency: "USD" },
          })),
        });
      }

      cursor = json.cursor;
    } while (cursor);

    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);
