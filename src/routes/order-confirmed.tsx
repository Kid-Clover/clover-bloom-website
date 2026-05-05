import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/cart";
import { useEffect } from "react";
import doodleCup from "@/assets/doodle-cup.png";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({ meta: [{ title: "Order Confirmed — Kid Clover" }] }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const { clear } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    clear();
    const timer = setTimeout(() => navigate({ to: "/shop" }), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <img src={doodleCup} alt="" aria-hidden className="h-28 w-auto mb-6" />
      <p className="font-marker text-2xl text-clover mb-3">your order is brewing!</p>
      <h1 className="font-display text-5xl text-brown mb-4">Thank you!</h1>
      <p className="text-lg text-foreground/75 max-w-sm mb-2">
        Your order has been placed. Check your email for a confirmation from Square.
      </p>
      <p className="text-sm text-muted-foreground">Taking you back to the shop…</p>
    </div>
  );
}
