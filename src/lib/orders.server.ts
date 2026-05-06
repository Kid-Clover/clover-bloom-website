import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

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
  const fulfillment = o.fulfillments?.[0]?.shipment_details;
  const isCancelled = o.fulfillments?.some((f: any) => f.state === "CANCELED") ?? false;
  return {
    id: o.id,
    createdAt: o.created_at,
    state: o.state ?? "COMPLETED",
    isRefunded: isCancelled,
    lineItems: (o.line_items ?? []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.total_money,
      note: item.note,
    })),
    totalMoney: o.total_money,
    fulfillmentName: fulfillment?.recipient?.display_name,
    fulfillmentAddress: formatAddress(fulfillment?.recipient?.address),
  };
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

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
  async ({ data }: { data: { email: string } }): Promise<SquareOrder[]> => {
    const e = env as Cloudflare.Env;
    const h = headers(e.SQUARE_ACCESS_TOKEN);

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

    const customerIds = customers.map((c: any) => c.id);

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
    const fulfillmentData = (ordersJson.orders ?? []).map((o: any) => ({
      orderId: o.id,
      fulfillments: o.fulfillments,
    }));
    console.log("FULFILLMENTS:", JSON.stringify(fulfillmentData, null, 2));
    return (ordersJson.orders ?? []).map(mapOrder);
  }
);
