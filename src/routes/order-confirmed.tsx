import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useCart } from "@/context/cart";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth.server";
import { getOrder, saveUserOrder, type SquareOrder } from "@/lib/orders.server";
import doodleCup from "@/assets/doodle-cup.png";
import { Printer, User } from "lucide-react";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({ meta: [{ title: "Order Confirmed — Kid Clover" }] }),
  validateSearch: z.object({
    orderId: z.string().optional(),
    checkoutId: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ orderId: search.orderId }),
  loader: async ({ deps: { orderId } }) => {
    const [order, user] = await Promise.all([
      orderId ? getOrder({ data: { orderId } }) : Promise.resolve(null),
      getCurrentUser(),
    ]);
    if (user && orderId && order) {
      await saveUserOrder({ data: { orderId, createdAt: order.createdAt } });
    }
    return { order, user };
  },
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const { clear } = useCart();
  const { order, user } = Route.useLoaderData();

  useEffect(() => {
    clear();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center mb-10">
          <img src={doodleCup} alt="" aria-hidden className="h-24 w-auto mx-auto mb-4" />
          <p className="font-marker text-2xl text-clover mb-2">your order is brewing!</p>
          <h1 className="font-display text-5xl text-brown mb-3">Thank you!</h1>
          {order && (
            <p className="text-sm text-muted-foreground font-mono">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
          )}
        </div>

        {order ? (
          <OrderSummary order={order} />
        ) : (
          <div className="rounded-2xl border-2 border-brown bg-card p-6 shadow-doodle mb-6 text-center">
            <p className="text-muted-foreground">
              Check your email for a confirmation from Square.
            </p>
          </div>
        )}

        {!user && (
          <div className="rounded-2xl border-2 border-clover/40 bg-clover/5 p-5 mb-6 flex gap-4 items-start">
            <User size={20} className="text-clover mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-marker text-lg text-clover mb-1">Save your order history</p>
              <p className="text-sm text-foreground/75 mb-3">
                Create an account or log in to keep track of all your Kid Clover orders in one place.
              </p>
              <Link
                to="/auth/login"
                className="font-marker text-sm text-brown border-2 border-brown rounded-full px-4 py-1.5 hover:bg-brown hover:text-cream transition-colors shadow-doodle inline-block"
              >
                Login / Sign up →
              </Link>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 font-marker text-sm text-brown/60 hover:text-brown transition-colors"
            >
              <Printer size={14} />
              Print this page for your records
            </button>
          </p>
          {user && (
            <p>
              <Link to="/orders" className="font-marker text-clover hover:underline">
                View your order history →
              </Link>
            </p>
          )}
          <p>
            <Link
              to="/shop"
              className="font-marker text-brown/60 hover:text-brown transition-colors text-sm"
            >
              ← Back to the shop
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ order }: { order: SquareOrder }) {
  return (
    <div className="rounded-2xl border-2 border-brown bg-card p-6 shadow-doodle mb-6 space-y-4">
      <h2 className="font-marker text-xl text-clover">Order Summary</h2>

      <div className="space-y-3">
        {order.lineItems.map((item, i) => (
          <div key={i} className="flex justify-between items-start gap-4">
            <div>
              <p className="font-display text-lg text-brown leading-tight">
                {item.quantity}× {item.name}
              </p>
              {item.note && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
              )}
            </div>
            <p className="font-display text-lg text-brown whitespace-nowrap">
              ${(item.totalMoney.amount / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 pt-3 flex justify-between font-display text-xl text-brown">
        <span>Total</span>
        <span>${(order.totalMoney.amount / 100).toFixed(2)}</span>
      </div>

      {(order.fulfillmentName || order.fulfillmentAddress) && (
        <div className="border-t border-border/60 pt-3">
          <p className="font-marker text-sm text-clover mb-1">shipping to</p>
          {order.fulfillmentName && (
            <p className="text-sm text-brown">{order.fulfillmentName}</p>
          )}
          {order.fulfillmentAddress && (
            <p className="text-sm text-muted-foreground">{order.fulfillmentAddress}</p>
          )}
        </div>
      )}
    </div>
  );
}
