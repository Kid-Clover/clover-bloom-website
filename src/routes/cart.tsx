import { createFileRoute, Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import { getProducts, type Product } from "@/lib/products.server";
import { getPickupEvents, type PickupEvent } from "@/lib/events.server";
import { useCart } from "@/context/cart";
import { createCheckout } from "@/lib/checkout.server";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, Truck, MapPin } from "lucide-react";
import { useState } from "react";

import pinkPopPotion from "@/assets/product-pink-pop-potion.png";
import pixieDust from "@/assets/product-pixie-dust.png";
import threeSimples from "@/assets/product-3-simples.png";
import sixSimples from "@/assets/product-6-simples.png";
import dayDreamers from "@/assets/product-day-dreamers.png";
import tinyRecess from "@/assets/product-tiny-recess.png";
import tigersEye from "@/assets/product-tigers-eye.png";
import crystalCauldron from "@/assets/product-crystal-cauldron.png";
import dragonflies from "@/assets/product-dragonflies.png";
import griffinsGold from "@/assets/product-griffins-gold.png";
import ogressLantern from "@/assets/product-ogress-lantern.png";

const productImages: Record<string, string> = {
  "pink-pop-potion": pinkPopPotion,
  "day-dreamer": dayDreamers,
  "tiny-recess": tinyRecess,
  "tigers-eye-ginger": tigersEye,
  "crystal-cauldron-chamomile": crystalCauldron,
  "dragonflies-society-rose-hips": dragonflies,
  "griffins-gold-lemon-verbena": griffinsGold,
  "ogress-lantern-lemon-balm": ogressLantern,
  "pixie-dust-peppermint": pixieDust,
  "3-simples": threeSimples,
  "6-simples": sixSimples,
};

export const Route = createFileRoute("/cart")({
  loader: async () => {
    const [products, pickupEvents] = await Promise.all([getProducts(), getPickupEvents()]);
    return { products, pickupEvents };
  },
  head: () => ({ meta: [{ title: "Your Cart — Kid Clover" }] }),
  component: CartPage,
});

const rootRoute = getRouteApi("__root__");

function CartPage() {
  const { products, pickupEvents } = Route.useLoaderData();
  const user = rootRoute.useLoaderData();
  const { cart, itemCount, setQuantity, remove } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);

  const selectedPickup = pickupEvents.find((e) => e.id === selectedPickupId) ?? null;

  const productMap = Object.fromEntries(
    products.map((p) => [
      p.id,
      { name: p.name, squareVariationId: p.squareVariationId, price: p.price },
    ])
  );

  const itemsWithProducts = cart.items
    .map((item, index) => ({ item, index, product: products.find((p) => p.id === item.productId) }))
    .filter((x): x is typeof x & { product: Product } => !!x.product);

  const subtotal = itemsWithProducts.reduce(
    (sum, { item, product }) => sum + product.price * item.quantity,
    0
  );

  async function handleCheckout() {
    if (fulfillment === "pickup" && !selectedPickup) return;
    setLoading(true);
    setCheckoutError(null);
    try {
      const pickup = selectedPickup
        ? {
            squareLocationId: selectedPickup.square_location_id,
            pickupAt: selectedPickup.start_time,
            locationName: selectedPickup.location_name,
          }
        : undefined;
      const url = await createCheckout({ data: { items: cart.items, productMap, pickup } });
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCheckoutError(`Checkout error: ${msg}`);
      setLoading(false);
      console.error("[checkout error]", err);
    }
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <ShoppingBag size={64} className="text-brown/20 mb-6" />
        <h1 className="font-display text-4xl text-brown mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some teas and come back!</p>
        <Link
          to="/shop"
          className="font-marker text-xl text-brown border-2 border-brown rounded-full px-6 py-2 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
        >
          Back to the shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-marker text-2xl text-clover mb-2">ready to brew?</p>
        <h1 className="font-display text-5xl text-brown mb-10">Your cart</h1>

        <div className="space-y-4 mb-10">
          {itemsWithProducts.map(({ item, index, product }) => {
            const modifierNames =
              item.modifiers &&
              Object.entries(item.modifiers)
                .filter(([, count]) => count > 0)
                .map(([id, count]) => `${count}× ${productMap[id]?.name ?? id}`)
                .join(", ");

            return (
              <div
                key={`${item.productId}-${index}`}
                className="flex gap-4 rounded-2xl border-2 border-brown bg-card p-4 shadow-doodle"
              >
                <img
                  src={productImages[product.imageKey]}
                  alt={product.name}
                  className="h-20 w-20 rounded-xl object-contain bg-clover/10 p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl text-brown leading-tight">{product.name}</h3>
                  {modifierNames && (
                    <p className="text-xs text-muted-foreground mt-0.5">{modifierNames}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(index, item.quantity - 1)}
                        className="h-7 w-7 rounded-full border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-cream transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-marker text-lg text-brown w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(index, item.quantity + 1)}
                        className="h-7 w-7 rounded-full border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-cream transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl text-brown">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => remove(index)}
                        className="text-brown/40 hover:text-clover transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FULFILLMENT SELECTOR */}
        <div className="rounded-2xl border-2 border-brown bg-card p-6 shadow-doodle mb-4">
          <p className="font-marker text-lg text-brown mb-4">How do you want to receive your order?</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setFulfillment("ship")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                fulfillment === "ship"
                  ? "border-clover bg-clover/10 text-clover"
                  : "border-brown/30 text-brown/60 hover:border-brown/60"
              }`}
            >
              <Truck size={24} />
              <span className="font-marker text-base">Ship to me</span>
            </button>
            <button
              onClick={() => { setFulfillment("pickup"); if (!selectedPickupId && pickupEvents.length > 0) setSelectedPickupId(pickupEvents[0].id); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                fulfillment === "pickup"
                  ? "border-clover bg-clover/10 text-clover"
                  : "border-brown/30 text-brown/60 hover:border-brown/60"
              }`}
            >
              <MapPin size={24} />
              <span className="font-marker text-base">Pick up at event</span>
            </button>
          </div>

          {fulfillment === "pickup" && (
            <div className="space-y-2">
              <p className="font-marker text-sm text-brown/70 mb-2">Choose a pickup date:</p>
              {pickupEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">No upcoming pickup events — check back soon!</p>
              ) : (
                pickupEvents.map((e) => {
                  const dt = new Date(e.start_time);
                  const dateStr = dt.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
                  const timeStr = dt.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
                  const isSelected = selectedPickupId === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedPickupId(e.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border-2 p-3 text-left transition-colors ${
                        isSelected
                          ? "border-clover bg-clover/10"
                          : "border-brown/30 hover:border-brown/60"
                      }`}
                    >
                      <div className={`flex-shrink-0 w-12 text-center ${isSelected ? "text-clover" : "text-brown"}`}>
                        <div className="font-display text-2xl leading-none">{dt.getUTCDate()}</div>
                        <div className="font-marker text-xs">{dt.toLocaleString("en", { month: "short", timeZone: "UTC" })}</div>
                      </div>
                      <div className="min-w-0">
                        <p className={`font-marker text-base leading-tight ${isSelected ? "text-clover" : "text-brown"}`}>{e.location_name.split(",")[0]}</p>
                        <p className="text-xs text-muted-foreground">{timeStr}</p>
                      </div>
                      <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? "border-clover bg-clover" : "border-brown/40"}`} />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-2 border-brown bg-card p-6 shadow-doodle space-y-3">
          <div className="flex justify-between font-marker text-lg text-brown">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {fulfillment === "ship" ? (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pickup</span>
              <span className="text-clover">Free</span>
            </div>
          )}
          <div className="border-t border-border/60 pt-3 flex justify-between font-display text-2xl text-brown">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {checkoutError && (
            <p className="text-sm text-red-600 text-center">{checkoutError}</p>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading || (fulfillment === "pickup" && !selectedPickup)}
            className="w-full h-12 rounded-full border-2 border-brown text-base font-marker text-xl shadow-doodle mt-2"
          >
            {loading ? "Preparing checkout…" : "Proceed to checkout →"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/auth/login" className="text-clover hover:underline">
                Log in
              </Link>{" "}
              before checkout to save your order history.
            </p>
          )}

          <div className="text-center">
            <Link
              to="/shop"
              className="font-marker text-brown/60 hover:text-brown transition-colors text-sm"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
