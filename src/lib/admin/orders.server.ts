import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

const SQUARE_API = "https://connect.squareup.com/v2";

export type AdminOrderRecord = {
  id: string;
  createdAt: string;
  state: string;
  isRefunded: boolean;
  totalMoney: { amount: number; currency: string };
  lineItems: Array<{ name: string; quantity: string; totalMoney: { amount: number; currency: string } }>;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
};

type UserRow = { id: number; email: string; name: string | null; square_customer_id: string | null };

export const adminGetAllOrders = createServerFn().handler(async (): Promise<AdminOrderRecord[]> => {
  await requireAdmin();
  const e = env as Cloudflare.Env;
  const db = e.DB;

  const { results: users } = await db
    .prepare("SELECT id, email, name, square_customer_id FROM users")
    .all<UserRow>();

  const h = {
    Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-01-23",
  };

  // Resolve Square customer IDs sequentially, caching discoveries to DB
  const customerToUser = new Map<string, UserRow>();
  for (const u of users) {
    if (u.square_customer_id) {
      customerToUser.set(u.square_customer_id, u);
      continue;
    }
    try {
      const res = await fetch(`${SQUARE_API}/customers/search`, {
        method: "POST", headers: h,
        body: JSON.stringify({ query: { filter: { email_address: { exact: u.email } } } }),
      });
      const json = await res.json() as { customers?: Array<{ id: string }> };
      const cid = json.customers?.[0]?.id;
      if (cid) {
        customerToUser.set(cid, u);
        await db.prepare("UPDATE users SET square_customer_id = ? WHERE id = ?").bind(cid, u.id).run();
      }
    } catch {
      // skip
    }
  }

  const customerIds = [...customerToUser.keys()];
  if (customerIds.length === 0) return [];

  // Fetch all active location IDs
  const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
  const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
  const locationIds = (locJson.locations ?? []).filter((l) => l.status === "ACTIVE").map((l) => l.id);
  if (locationIds.length === 0) return [];

  // Fetch all orders for our customers across all locations
  const allOrders: AdminOrderRecord[] = [];
  let cursor: string | undefined;
  do {
    const body: Record<string, unknown> = {
      location_ids: locationIds,
      limit: 500,
      query: {
        filter: { customer_filter: { customer_ids: customerIds } },
        sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
      },
    };
    if (cursor) body.cursor = cursor;
    const res = await fetch(`${SQUARE_API}/orders/search`, {
      method: "POST", headers: h, body: JSON.stringify(body),
    });
    const json = await res.json() as { orders?: any[]; cursor?: string };
    for (const o of json.orders ?? []) {
      const user = customerToUser.get(o.customer_id);
      allOrders.push({
        id: o.id,
        createdAt: o.created_at,
        state: o.state ?? "COMPLETED",
        isRefunded: o.fulfillments?.[0]?.state === "CANCELED",
        totalMoney: o.total_money ?? { amount: 0, currency: "USD" },
        lineItems: (o.line_items ?? []).map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          totalMoney: item.total_money ?? { amount: 0, currency: "USD" },
        })),
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        userName: user?.name ?? null,
      });
    }
    cursor = json.cursor;
  } while (cursor);

  return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});
