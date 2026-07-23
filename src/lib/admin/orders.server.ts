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

type UserRow = { id: number; email: string; name: string | null };

export const adminGetAllOrders = createServerFn().handler(async (): Promise<AdminOrderRecord[]> => {
  await requireAdmin();
  const e = env as Cloudflare.Env;
  const db = e.DB;

  const { results: users } = await db
    .prepare("SELECT id, email, name FROM users")
    .all<UserRow>();

  const emailToUser = new Map<string, UserRow>();
  for (const u of users) {
    emailToUser.set(u.email.toLowerCase(), u);
  }

  const h = {
    Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-01-23",
  };

  const locRes = await fetch(`${SQUARE_API}/locations`, { headers: h });
  const locJson = await locRes.json() as { locations?: Array<{ id: string; status?: string }> };
  const locationIds = (locJson.locations ?? []).filter((l) => l.status === "ACTIVE").map((l) => l.id);
  if (locationIds.length === 0) return [];

  // Fetch all SHIPMENT and PICKUP orders — these are the website/online orders.
  // customer_id is null on all of them; recipient email is in fulfillment details.
  const allOrders: AdminOrderRecord[] = [];
  const seenIds = new Set<string>();

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
      if (seenIds.has(o.id)) continue;
      seenIds.add(o.id);

      const fulfillment = o.fulfillments?.[0];
      const recipient =
        fulfillment?.shipment_details?.recipient ??
        fulfillment?.pickup_details?.recipient;
      const recipientEmail = (recipient?.email_address ?? "").toLowerCase() || null;
      const recipientName = recipient?.display_name ?? null;

      const user = recipientEmail ? emailToUser.get(recipientEmail) : undefined;

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
        userId: user?.id ?? null,
        userEmail: recipientEmail ?? user?.email ?? null,
        userName: user?.name ?? recipientName,
      });
    }

    cursor = json.cursor;
  } while (cursor);

  return allOrders;
});
