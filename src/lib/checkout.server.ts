import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getSessionUser } from "./session.server";
import type { CartItem } from "./cart";

const LOCATION_ID = "L4TWM1M1RC52V";

type CheckoutInput = {
  items: CartItem[];
  productMap: Record<string, { name: string; squareVariationId: string; price: number }>;
};

export const createCheckout = createServerFn()
  .handler(async ({ data }: { data: CheckoutInput }): Promise<string> => {
    const e = env as Cloudflare.Env;
    const user = await getSessionUser();

    const lineItems = data.items.map((item) => {
      const product = data.productMap[item.productId];
      const note =
        item.modifiers && Object.keys(item.modifiers).length > 0
          ? Object.entries(item.modifiers)
              .filter(([, count]) => count > 0)
              .map(([id, count]) => {
                const name = data.productMap[id]?.name ?? id;
                return `${count}× ${name}`;
              })
              .join(", ")
          : undefined;

      return {
        catalog_object_id: product.squareVariationId,
        quantity: String(item.quantity),
        ...(note ? { note } : {}),
      };
    });

    const prePopulatedData: Record<string, string> = {};
    if (user?.email) prePopulatedData.buyer_email = user.email;

    const body = {
      idempotency_key: crypto.randomUUID(),
      order: { location_id: LOCATION_ID, line_items: lineItems },
      checkout_options: {
        redirect_url: "https://drinkkidclover.com/order-confirmed",
        ask_for_shipping_address: true,
      },
      ...(Object.keys(prePopulatedData).length > 0
        ? { pre_populated_data: prePopulatedData }
        : {}),
    };

    const res = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as { payment_link?: { url: string }; errors?: unknown[] };

    if (!json.payment_link?.url) {
      throw new Error("Failed to create Square checkout");
    }

    return json.payment_link.url;
  });
