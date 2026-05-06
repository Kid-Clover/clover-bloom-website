import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth.server";
import { getOrdersByEmail, type SquareOrder } from "@/lib/orders.server";
import { Package } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — Kid Clover" }] }),
  loader: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/auth/login", statusCode: 302 });
    const orders = await getOrdersByEmail({ data: { email: user.email } });
    return { orders };
  },
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-marker text-2xl text-clover mb-2">brewed with love</p>
        <h1 className="font-display text-5xl text-brown mb-10">My Orders</h1>

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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
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
        <p className="font-display text-xl text-brown">
          ${(order.totalMoney.amount / 100).toFixed(2)}
        </p>
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

      {order.fulfillmentAddress && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
          Shipped to {order.fulfillmentAddress}
        </p>
      )}
    </div>
  );
}
