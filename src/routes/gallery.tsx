import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import teaDoily from "@/assets/gallery-tea-doily.jpg";
import handsCup from "@/assets/gallery-hands-cup.jpg";
import glendyPouch from "@/assets/gallery-glendy-pouch.jpg";
import kidsBridge from "@/assets/gallery-kids-bridge.jpg";
import shashiBasket from "@/assets/gallery-shashi-basket.jpg";
import pouchRoses from "@/assets/gallery-pouch-roses.jpg";
import bowlTea from "@/assets/gallery-bowl-tea.jpg";
import pouchLace from "@/assets/gallery-pouch-lace.jpg";
import cloverHand from "@/assets/gallery-clover-hand.png";
import calendula from "@/assets/gallery-calendula.png";
import elecampaneSky from "@/assets/gallery-elecampane-sky.png";
import elderflower from "@/assets/gallery-elderflower.png";
import icedTeaJar from "@/assets/gallery-iced-tea-jar.png";
import magentaClover from "@/assets/gallery-magenta-clover.png";
import meadowSunset from "@/assets/gallery-meadow-sunset.png";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Kid Clover" },
      {
        name: "description",
        content:
          "Photos from the farms and gardens where Kid Clover sources every herb and flower.",
      },
      { property: "og:title", content: "Kid Clover Gallery" },
      { property: "og:description", content: "Plants, farms, and tiny hands." },
    ],
  }),
  component: GalleryPage,
});

const photos: { src: string; alt: string }[] = [
  { src: teaDoily, alt: "Glass cup of pink herbal tea on a lace doily with strawberries and a clay teapot" },
  { src: handsCup, alt: "Child's hands holding a glass of herbal tea garnished with yellow flowers" },
  { src: glendyPouch, alt: "Kid Clover Glendy & The Aunties herbal tea pouch with berries" },
  { src: kidsBridge, alt: "Two children sipping tea on a wooden bridge with a basket of flowers" },
  { src: shashiBasket, alt: "Shashi La Blooms tea pouch nestled in a basket of roses and wildflowers" },
  { src: pouchRoses, alt: "Kid Clover tea pouch and glass cup beside pink roses and herbs" },
  { src: bowlTea, alt: "Wooden bowl of loose herbal tea blend beside a glass cup of brewed tea" },
  { src: pouchLace, alt: "Kid Clover pouch and a wooden bowl of herbal tea on lace tablecloth" },
];

function GalleryPage() {
  const [idx, setIdx] = useState<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(
    () => setIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [],
  );
  const next = useCallback(
    () => setIdx((i) => (i === null ? null : (i + 1) % photos.length)),
    [],
  );

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, close, prev, next]);

  return (
    <div className="bg-paper min-h-screen">
      <header className="px-6 pt-20 pb-12 text-center max-w-4xl mx-auto">
        <p className="font-marker text-2xl text-clover mb-2">our gardens</p>
        <h1 className="text-5xl md:text-7xl font-display text-brown leading-tight">
          Where the magic grows
        </h1>
        
        <p className="mt-6 text-lg text-foreground/75 max-w-2xl mx-auto">
          A peek at the farms, gardens, and tiny hands that make every Kid
          Clover blend possible.
        </p>
      </header>

      <section className="px-4 md:px-6 pb-24 max-w-7xl mx-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-5 [column-fill:_balance]">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="mb-3 md:mb-5 break-inside-avoid block w-full overflow-hidden rounded-2xl border-2 border-brown shadow-doodle hover:-translate-y-1 transition-transform"
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-full h-auto block hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </section>

      {idx !== null && (
        <div
          className="fixed inset-0 z-50 bg-brown/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={close}
        >
          <button
            className="absolute top-4 right-4 text-cream p-2 hover:bg-cream/10 rounded-full"
            onClick={close}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-2 md:left-6 text-cream p-2 hover:bg-cream/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="absolute right-2 md:right-6 text-cream p-2 hover:bg-cream/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>

          <img
            src={photos[idx].src}
            alt={photos[idx].alt}
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
