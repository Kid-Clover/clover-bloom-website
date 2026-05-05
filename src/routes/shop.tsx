import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { products, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExternalLink, X } from "lucide-react";
import logoStacked from "@/assets/logo-stacked.png";
import doodleCup from "@/assets/doodle-cup.png";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Kid Clover Teas" },
      {
        name: "description",
        content:
          "Browse our hand-blended herbal teas for kids. Buy individual pouches via Square checkout.",
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

function ShopPage() {
  const [active, setActive] = useState<Product | null>(null);

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
          Each pouch makes about 30 cups. Tap a tea to see ingredients and brewing notes — Buy
          Now opens our Square shop in a new tab.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`group flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-brown text-left shadow-doodle transition-transform hover:-translate-y-1 ${colorBg[p.color]}`}
            >
              <div className={`flex aspect-square w-full min-w-0 items-center justify-center overflow-hidden ${colorBg[p.color]}`}>
                <img
                  src={p.image}
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
                  <span className="font-marker text-brown">view →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 border-brown bg-card p-0 [&>button]:hidden">
          {active && (
            <div className="grid md:grid-cols-2">
              <div className={`flex aspect-square w-full min-w-0 items-center justify-center overflow-hidden md:aspect-auto ${colorBg[active.color]}`}>
                <img
                  src={active.image}
                  alt={active.name}
                  className="block h-auto w-[80%] max-w-[80%] object-contain object-center md:max-h-[28rem] md:w-[80%] md:max-w-[80%]"
                />
              </div>
              <div className="relative p-6 md:p-8">
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
                >
                  <X size={22} />
                </button>
                <p className="font-marker text-xl text-clover">{active.tagline}</p>
                <h2 className="mb-2 font-display text-4xl text-brown">{active.name}</h2>
                <p className="mb-4 font-display text-3xl text-brown">${active.price}</p>
                <p className="mb-5 leading-relaxed text-foreground/80">{active.description}</p>
                <div className="mb-6">
                  <p className="mb-2 font-marker text-lg text-clover">what's inside</p>
                  <ul className="space-y-1.5">
                    {active.ingredients.map((ing) => (
                      <li key={ing} className="flex items-center gap-2 text-sm">
                        <span className="text-olive">•</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full border-2 border-brown text-base shadow-doodle"
                >
                  <a href={active.squareUrl} target="_blank" rel="noopener noreferrer">
                    Buy now <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Checkout happens securely on our Square shop.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
