import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getSessionUser } from "./session.server";

const LOCATION_ID = "L4TWM1M1RC52V";
const SQUARE_API = "https://connect.squareup.com/v2";

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
  customerId?: string;
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
    customerId: o.customer_id,
  };
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const saveSquareCustomerId = createServerFn().handler(
  async ({ data }: { data: { squareCustomerId: string } }) => {
    const user = await getSessionUser();
    if (!user) return;
    const e = env as Cloudflare.Env;
    await e.DB.prepare(
      "UPDATE users SET square_customer_id = ? WHERE id = ? AND square_customer_id IS NULL"
    )
      .bind(data.squareCustomerId, user.id)
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
  async ({ data }: { data: { email: string; userId: number } }): Promise<SquareOrder[]> => {
    const e = env as Cloudflare.Env;
    const h = headers(e.SQUARE_ACCESS_TOKEN);

    // Use stored Square customer ID if available (avoids email mismatch)
    const userRow = await e.DB.prepare(
      "SELECT square_customer_id FROM users WHERE id = ?"
    )
      .bind(data.userId)
      .first<{ square_customer_id: string | null }>();

    let customerIds: string[];

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
      const customers = custJson.customers ?? [];
      if (customers.length === 0) return [];
      customerIds = customers.map((c: any) => c.id);
    }

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
    return (ordersJson.orders ?? []).map(mapOrder);
  }
);
