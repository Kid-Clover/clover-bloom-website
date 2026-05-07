import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getSessionUser } from "./session.server";

const LOCATION_ID = "L4TWM1M1RC52V";
const SQUARE_API = "https://connect.squareup.com/v2";

export type Filter = "30d" | "3m" | "all";

export type SquareLineItem = {
  name: string;
  quantity: string;
  totalMoney: { amount: number; currency: string };
  note?: string;
};

export type SquareOrder = {
  id: string;
  createdAt: string;
  state: "OPEN" | "COMPLETED" | "CANCELED";
  isRefunded: boolean;
  lineItems: SquareLineItem[];
  totalMoney: { amount: number; currency: string };
  fulfillmentName?: string;
  fulfillmentAddress?: string;
  fulfillmentState?: string;
  carrier?: string;
  shippingType?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
};

function formatAddress(addr: any): string | undefined {
  if (!addr) return undefined;
  return [
    addr.address_line_1,
    addr.address_line_2,
    [addr.locality, addr.administrative_district_level_1, addr.postal_code]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function mapOrder(o: any): SquareOrder {
  const fulfillmentObj = o.fulfillments?.[0];
  const shipment = fulfillmentObj?.shipment_details;
  const fulfillmentState: string = fulfillmentObj?.state ?? "PROPOSED";
  return {
    id: o.id,
    createdAt: o.created_at,
    state: o.state ?? "COMPLETED",
    isRefunded: fulfillmentState === "CANCELED",
    lineItems: (o.line_items ?? []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.total_money,
      note: item.note,
    })),
    totalMoney: o.total_money,
    fulfillmentName: shipment?.recipient?.display_name,
    fulfillmentAddress: formatAddress(shipment?.recipient?.address),
    fulfillmentState,
    carrier: shipment?.carrier,
    shippingType: shipment?.shipping_type,
    trackingNumber: shipment?.tracking_number,
    trackingUrl: shipment?.tracking_url,
    shippedAt: shipment?.shipped_at,
  };
}

function filterByDate(orders: SquareOrder[], filter: Filter): SquareOrder[] {
  if (filter === "all") return orders;
  const now = Date.now();
  const ms = filter === "30d" ? 30 * 24 * 60 * 60 * 1000 : 90 * 24 * 60 * 60 * 1000;
  return orders.filter((o) => now - new Date(o.createdAt).getTime() <= ms);
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const saveUserOrder = createServerFn().handler(
  async ({ data }: { data: { orderId: string; createdAt?: string } }) => {
    const user = await getSessionUser();
    if (!user) return;
    const e = env as Cloudflare.Env;
    await e.DB.prepare(
      "INSERT OR IGNORE INTO user_orders (user_id, order_id, created_at) VALUES (?, ?, ?)"
    )
      .bind(user.id, data.orderId, data.createdAt ?? null)
      .run();
  }
);

export const getOrder = createServerFn().handler(
  async ({ data }: { data: { orderId: string } }): Promise<SquareOrder | null> => {
    const e = env as Cloudflare.Env;
    const res = await fetch(`${SQUARE_API}/orders/${data.orderId}`, {
      headers: headers(e.SQUARE_ACCESS_TOKEN),
    });
    const json = (await res.json()) as { order?: any };
    return json.order ? mapOrder(json.order) : null;
  }
);

export const getOrdersByEmail = createServerFn().handler(
  async ({
    data,
  }: {
    data: { email: string; userId: number; filter: Filter };
  }): Promise<SquareOrder[]> => {
    const e = env as Cloudflare.Env;
    const h = headers(e.SQUARE_ACCESS_TOKEN);
    const { filter } = data;

    // Build date threshold for DB query
    const dateClause =
      filter === "30d"
        ? "AND (created_at IS NULL OR created_at >= datetime('now', '-30 days'))"
        : filter === "3m"
          ? "AND (created_at IS NULL OR created_at >= datetime('now', '-90 days'))"
          : "";

    const storedRows = await e.DB.prepare(
      `SELECT order_id FROM user_orders WHERE user_id = ? ${dateClause}`
    )
      .bind(data.userId)
      .all<{ order_id: string }>();
    const storedOrderIds = storedRows.results.map((r) => r.order_id);

    const userRow = await e.DB.prepare(
      "SELECT square_customer_id FROM users WHERE id = ?"
    )
      .bind(data.userId)
      .first<{ square_customer_id: string | null }>();

    const allOrders: SquareOrder[] = [];
    const seenIds = new Set<string>();

    if (storedOrderIds.length > 0) {
      const batchRes = await fetch(`${SQUARE_API}/orders/batch-retrieve`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ order_ids: storedOrderIds }),
      });
      const batchJson = (await batchRes.json()) as { orders?: any[] };
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
        method: "POST",
        headers: h,
        body: JSON.stringify({
          query: { filter: { email_address: { exact: data.email } } },
        }),
      });
      const custJson = (await custRes.json()) as { customers?: any[] };
      customerIds = (custJson.customers ?? []).map((c: any) => c.id);
    }

    if (customerIds.length > 0) {
      const ordersRes = await fetch(`${SQUARE_API}/orders/search`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          location_ids: [LOCATION_ID],
          query: {
            filter: { customer_filter: { customer_ids: customerIds } },
            sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
          },
        }),
      });
      const ordersJson = (await ordersRes.json()) as { orders?: any[] };
      for (const o of ordersJson.orders ?? []) {
        if (!seenIds.has(o.id)) {
          allOrders.push(mapOrder(o));
          seenIds.add(o.id);
        }
      }
    }

    return filterByDate(allOrders, filter).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
);
