import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { getProducts, type Product } from "@/lib/products.server";
import { type CartModifiers } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/cart";
import logoStacked from "@/assets/logo-stacked.png";
import doodleCup from "@/assets/doodle-cup.png";

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

export const Route = createFileRoute("/shop")({
  validateSearch: z.object({
    product: z.string().optional(),
  }),
  loader: () => getProducts(),
  head: () => ({
    meta: [
      { title: "Shop — Kid Clover Teas" },
      {
        name: "description",
        content: "Browse our hand-blended herbal teas for kids.",
      },
      { property: "og:title", content: "Shop Kid Clover" },
      { property: "og:description", content: "Hand-blended herbal teas for kids." },
    ],
  }),
  component: ShopPage, // swap to ShopMaintenance to close
});

function ShopMaintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <img src={logoStacked} alt="Kid Clover" className="h-32 w-auto mb-8" />
      <p className="font-marker text-2xl text-clover mb-3">oops, we stepped away for a moment</p>
      <h1 className="font-display text-5xl md:text-6xl text-brown leading-tight max-w-xl mb-6">
        Our shop is taking a little tea break
      </h1>
      <p className="text-lg text-foreground/75 max-w-md mb-4">
        We're working behind the scenes to make sure every order gets to you just right.
        Check back soon — the teas aren't going anywhere!
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mb-10">
        In the meantime, find us at the farmers market every Saturday or reach out at{" "}
        <a href="mailto:lesley@drinkkidclover.com" className="text-clover hover:underline">
          lesley@drinkkidclover.com
        </a>
      </p>
      <Link
        to="/events"
        className="font-marker text-xl text-brown border-2 border-brown rounded-full px-6 py-2 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
      >
        Find us at an event →
      </Link>
      <img src={doodleCup} alt="" aria-hidden className="h-32 w-auto mt-16 opacity-60" />
    </div>
  );
}

function ModifierSelector({
  product,
  modifiers,
  onChange,
}: {
  product: Product;
  modifiers: CartModifiers;
  onChange: (m: CartModifiers) => void;
}) {
  const group = product.modifiers!;
  const selected = Object.values(modifiers).reduce((a, b) => a + b, 0);
  const remaining = group.requiredCount - selected;

  function adjust(optionId: string, delta: number) {
    const current = modifiers[optionId] ?? 0;
    const next = Math.max(0, current + delta);
    if (delta > 0 && remaining <= 0) return;
    onChange({ ...modifiers, [optionId]: next });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="font-marker text-lg text-clover">pick your simples</p>
        <span className={`font-marker text-sm ${remaining === 0 ? "text-olive" : "text-brown/60"}`}>
          {selected}/{group.requiredCount} selected
        </span>
      </div>
      <div className="space-y-2">
        {group.options.map((opt) => {
          const count = modifiers[opt.productId] ?? 0;
          return (
            <div key={opt.productId} className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{opt.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(opt.productId, -1)}
                  disabled={count === 0}
                  className="h-6 w-6 rounded-full border border-brown flex items-center justify-center hover:bg-brown hover:text-cream transition-colors disabled:opacity-30"
                >
                  <Minus size={10} />
                </button>
                <span className="font-marker text-base text-brown w-4 text-center">{count}</span>
                <button
                  onClick={() => adjust(opt.productId, 1)}
                  disabled={remaining <= 0}
                  className="h-6 w-6 rounded-full border border-brown flex items-center justify-center hover:bg-brown hover:text-cream transition-colors disabled:opacity-30"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductModal({
  product,
  colorBg,
  onClose,
}: {
  product: Product;
  colorBg: string;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [modifiers, setModifiers] = useState<CartModifiers>({});
  const [added, setAdded] = useState(false);

  const needsModifiers = !!product.modifiers;
  const modifierTotal = Object.values(modifiers).reduce((a, b) => a + b, 0);
  const canAdd = !needsModifiers || modifierTotal === product.modifiers!.requiredCount;

  function handleAdd() {
    addItem({
      productId: product.id,
      quantity: 1,
      ...(needsModifiers ? { modifiers } : {}),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid md:grid-cols-2">
      <div className={`flex w-full min-w-0 items-center justify-center overflow-hidden aspect-[4/3] md:aspect-auto ${colorBg}`}>
        <img
          src={productImages[product.imageKey]}
          alt={product.name}
          className="block h-auto w-[70%] max-w-[70%] object-contain object-center md:max-h-[28rem]"
        />
      </div>
      <div className="relative p-6 md:p-8 md:overflow-y-auto md:max-h-[70vh]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
        >
          <X size={22} />
        </button>
        <p className="font-marker text-xl text-clover">{product.tagline}</p>
        <h2 className="mb-2 font-display text-4xl text-brown">{product.name}</h2>
        <p className="mb-4 font-display text-3xl text-brown">${product.price}</p>
        <p className="mb-5 leading-relaxed text-foreground/80">{product.description}</p>

        {!needsModifiers && (
          <div className="mb-6">
            <p className="mb-2 font-marker text-lg text-clover">what's inside</p>
            <ul className="space-y-1.5">
              {product.ingredients.map((ing) => (
                <li key={ing} className="flex items-center gap-2 text-sm">
                  <span className="text-olive">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {needsModifiers && (
          <ModifierSelector
            product={product}
            modifiers={modifiers}
            onChange={setModifiers}
          />
        )}

        <Button
          onClick={handleAdd}
          disabled={!canAdd}
          size="lg"
          className="h-12 w-full rounded-full border-2 border-brown text-base shadow-doodle"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {added ? "Added!" : needsModifiers && !canAdd ? `Choose ${product.modifiers!.requiredCount} simples` : "Add to cart"}
        </Button>

        {added && (
          <div className="mt-3 text-center">
            <Link to="/cart" className="font-marker text-sm text-clover hover:underline">
              View cart →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopPage() {
  const products = Route.useLoaderData();
  const { product: productId } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const active = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );

  const openProduct = (p: Product) => navigate({ search: { product: p.id } });
  const closeProduct = () => navigate({ search: {} });

  const colorBg: Record<Product["color"], string> = {
    clover: "bg-clover/25",
    lavender: "bg-lavender/40",
    "yellow-crayon": "bg-yellow-crayon/40",
    olive: "bg-olive/25",
  };

  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <p className="mb-2 font-marker text-2xl text-clover">all blends</p>
        <h1 className="font-display text-5xl leading-tight text-brown md:text-7xl">
          The Kid Clover shop
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
          Each pouch makes about 30 cups. Tap a tea to learn more and add it to your cart.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              className={`group flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-brown text-left shadow-doodle transition-transform hover:-translate-y-1 ${colorBg[p.color]}`}
            >
              <div className={`flex aspect-square w-full min-w-0 items-center justify-center overflow-hidden ${colorBg[p.color]}`}>
                <img
                  src={productImages[p.imageKey]}
                  alt={p.name}
                  loading="lazy"
                  className="block h-auto w-[80%] max-w-[80%] object-contain object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col bg-paper p-5">
                <p className="font-marker text-lg text-brown/70">{p.tagline}</p>
                <h3 className="mb-2 font-display text-3xl leading-tight text-brown">{p.name}</h3>
                <p className="line-clamp-2 text-sm text-brown/75">{p.description}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-display text-2xl text-brown">${p.price}</span>
                  <span className="font-marker text-brown">add to cart →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && closeProduct()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 border-brown bg-card p-0 [&>button]:hidden">
          {active && (
            <ProductModal
              product={active}
              colorBg={colorBg[active.color]}
              onClose={closeProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
