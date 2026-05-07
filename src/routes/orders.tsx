import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "@/lib/auth.server";
import { getOrdersByEmail, type SquareOrder } from "@/lib/orders.server";
import { Package, Truck } from "lucide-react";

type Filter = "30d" | "3m" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "all", label: "All time" },
];

function filterOrders(orders: SquareOrder[], filter: Filter): SquareOrder[] {
  if (filter === "all") return orders;
  const now = Date.now();
  const ms = filter === "30d" ? 30 * 24 * 60 * 60 * 1000 : 90 * 24 * 60 * 60 * 1000;
  return orders.filter((o) => now - new Date(o.createdAt).getTime() <= ms);
}

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — Kid Clover" }] }),
  loader: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/auth/login", statusCode: 302 });
    const orders = await getOrdersByEmail({ data: { email: user.email, userId: user.id } });
    return { orders };
  },
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = Route.useLoaderData();
  const [filter, setFilter] = useState<Filter>("30d");
  const filtered = filterOrders(orders, filter);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-marker text-2xl text-clover mb-2">brewed with love</p>
        <h1 className="font-display text-5xl text-brown mb-6">My Orders</h1>

        <div className="flex gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`font-marker text-sm rounded-full px-4 py-1.5 border-2 transition-colors ${
                filter === f.value
                  ? "bg-brown text-cream border-brown"
                  : "border-brown text-brown hover:bg-brown hover:text-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="text-brown/20 mx-auto mb-6" />
            <p className="font-display text-2xl text-brown mb-2">No orders yet</p>
            <p className="text-muted-foreground mb-8">
              Your order history will appear here after your first purchase.
            </p>
            <Link
              to="/shop"
              className="font-marker text-xl text-brown border-2 border-brown rounded-full px-6 py-2 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
            >
              Shop now →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No orders in this time period.
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: SquareOrder }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border-2 border-brown bg-card p-5 shadow-doodle">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-marker text-sm text-clover">{date}</p>
          <p className="text-xs text-muted-foreground font-mono">
            #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="font-display text-xl text-brown">
            ${(order.totalMoney.amount / 100).toFixed(2)}
          </p>
          {order.isRefunded && (
            <span className="text-xs font-marker text-white bg-brown/60 rounded-full px-2 py-0.5">
              Refunded
            </span>
          )}
          {order.state === "CANCELED" && (
            <span className="text-xs font-marker text-white bg-brown/40 rounded-full px-2 py-0.5">
              Cancelled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {order.lineItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-olive mt-0.5">•</span>
            <span className="text-brown/80">
              {item.quantity}× {item.name}
              {item.note && (
                <span className="text-muted-foreground"> ({item.note})</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {!order.isRefunded && order.fulfillmentAddress && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
          Shipped to {order.fulfillmentAddress}
        </p>
      )}

      {!order.isRefunded && (
        <div className="mt-3 pt-3 border-t border-border/60">
          {order.fulfillmentState === "COMPLETED" ? (
            <div className="flex items-start gap-2">
              <Truck size={15} className="text-clover mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-marker text-sm text-clover">
                  Shipped{order.shippedAt
                    ? ` · ${new Date(order.shippedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : ""}
                </p>
                {(order.carrier || order.shippingType) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[order.carrier, order.shippingType].filter(Boolean).join(" · ")}
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {order.trackingNumber}
                  </p>
                )}
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-marker text-sm text-clover hover:underline mt-1 inline-block"
                  >
                    Track package →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Package size={15} className="text-brown/40 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Processing — your order is being prepared for shipment.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
