import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { ExternalLink, X } from "lucide-react";

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
  component: ShopPage,
});

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
      <header className="px-6 pt-20 pb-12 text-center max-w-4xl mx-auto">
        <p className="font-marker text-2xl text-clover mb-2">all blends</p>
        <h1 className="text-5xl md:text-7xl font-display text-brown leading-tight">
          The Kid Clover shop
        </h1>
        
        <p className="mt-6 text-lg text-foreground/75 max-w-2xl mx-auto">
          Each pouch makes about 30 cups. Tap a tea to see ingredients and
          brewing notes — Buy Now opens our Square shop in a new tab.
        </p>
      </header>

      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`group text-left border-2 border-brown rounded-3xl overflow-hidden shadow-doodle hover:-translate-y-1 transition-transform flex flex-col ${colorBg[p.color]}`}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="font-marker text-lg text-brown/70">{p.tagline}</p>
                <h3 className="font-display text-3xl text-brown leading-tight mb-2">
                  {p.name}
                </h3>
                <p className="text-sm text-brown/75 line-clamp-2">
                  {p.description}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="font-display text-2xl text-brown">${p.price}</span>
                  <span className="font-marker text-brown">view →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-2 border-brown rounded-3xl [&>button]:hidden">
          {active && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square md:aspect-auto bg-cream">
                <img
                  src={active.image}
                  alt={active.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 relative">
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
                >
                  <X size={22} />
                </button>

                <p className="font-marker text-xl text-clover">{active.tagline}</p>
                <h2 className="font-display text-4xl text-brown mb-2">
                  {active.name}
                </h2>
                <p className="font-display text-3xl text-brown mb-4">
                  ${active.price}
                </p>
                <p className="text-foreground/80 leading-relaxed mb-5">
                  {active.description}
                </p>

                <div className="mb-6">
                  <p className="font-marker text-lg text-clover mb-2">
                    what's inside
                  </p>
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
                  className="w-full rounded-full border-2 border-brown shadow-doodle text-base h-12"
                >
                  <a href={active.squareUrl} target="_blank" rel="noopener noreferrer">
                    Buy now <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
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
