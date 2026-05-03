import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { products } from "@/data/products";
import { events } from "@/data/events";
import { Squiggle, Sparkle, Sun, Clover, Leaf } from "@/components/doodles";
import heroBasket from "@/assets/hero-basket.jpg";
import heroHerbs from "@/assets/hero-herbs.jpg";
import heroKidFlower1 from "@/assets/hero-kid-flower-1.jpg";
import heroKidFlower2 from "@/assets/hero-kid-flower-2.jpg";
import heroKidFlower3 from "@/assets/hero-kid-flower-3.jpg";
import heroKidFlower4 from "@/assets/hero-kid-flower-4.jpg";
import heroMomKid1 from "@/assets/hero-mom-kid-1.jpg";
import heroSunTea from "@/assets/hero-suntea.jpg";
import galleryBush from "@/assets/photo-bush.png";
import galleryDesert from "@/assets/photo-desert.png";
import galleryCalendula from "@/assets/photo-calendula.png";
import badgeTeaMagic from "@/assets/badge-tea-magic.png";
import doodleCup from "@/assets/doodle-cup.png";
import doodleFlowerPink from "@/assets/doodle-flower-pink.png";
import doodleFlowerYellow from "@/assets/doodle-flower-yellow.png";
import doodleFairy from "@/assets/doodle-fairy.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kid Clover — Hand-blended herbal teas for kids" },
      {
        name: "description",
        content:
          "Kid Clover crafts gentle, joyful herbal tea blends made for little ones. Connecting kids to the magic of plants.",
      },
      { property: "og:title", content: "Kid Clover" },
      {
        property: "og:description",
        content: "Hand-blended herbal teas for kids.",
      },
    ],
  }),
  component: HomePage,
});

const heroImages = [
  { src: heroBasket, alt: "Basket of freshly harvested herbs" },
  { src: heroHerbs, alt: "Dried herbs being measured for blending" },
  { src: heroKidFlower1, alt: "Child holding a yellow flower" },
  { src: heroKidFlower2, alt: "Child reaching for purple flowers in the garden" },
  { src: heroKidFlower3, alt: "Child holding freshly picked purple flowers" },
  { src: heroKidFlower4, alt: "Child holding peach flowers in the garden" },
  { src: heroMomKid1, alt: "Founder and child together in the herb rows" },
  { src: heroSunTea, alt: "Jar of sun tea with strawberries and herbs" },
];

function HomePage() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <Carousel
          className="w-full"
          plugins={[autoplay.current]}
          opts={{ loop: true }}
        >
          <CarouselContent>
            {heroImages.map((img, i) => (
              <CarouselItem key={i}>
                <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    {...(i === 0 ? {} : { loading: "lazy" })}
                  />
                   <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-b from-brown/50 via-brown/20 to-brown/70" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <img src={doodleFlowerYellow} alt="" className="absolute top-[10%] left-[8%] w-20 md:w-28 animate-float drop-shadow-lg" />
          <img src={doodleFlowerPink} alt="" className="absolute bottom-[16%] left-[6%] w-24 md:w-32 animate-float drop-shadow-lg" style={{ animationDelay: "1s" }} />
          <img src={doodleFairy} alt="" className="absolute top-[14%] right-[8%] w-24 md:w-32 animate-float drop-shadow-lg" style={{ animationDelay: "0.6s" }} />
          <img src={doodleCup} alt="" className="absolute bottom-[14%] right-[10%] w-28 md:w-40 animate-float drop-shadow-lg" style={{ animationDelay: "1.4s" }} />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-cream drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] max-w-5xl leading-[1.05]">
            tea for tiny <span className="text-yellow-crayon">plant lovers</span>
          </h1>
          <p className="mt-6 font-marker text-2xl md:text-3xl text-cream max-w-2xl">
            connecting kids to the magic of plants
          </p>
          <div className="mt-10 pointer-events-auto flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full text-lg h-14 px-8 shadow-doodle border-2 border-brown">
              <Link to="/about">Learn more →</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full text-lg h-14 px-8 border-2 border-brown shadow-doodle">
              <Link to="/shop">Shop teas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-paper py-24 px-6 text-center relative overflow-hidden">
        <img src={doodleFlowerPink} alt="" className="absolute -left-6 top-10 w-28 -rotate-12 opacity-90" />
        <img src={doodleFlowerYellow} alt="" className="absolute -right-4 bottom-8 w-32 rotate-12 opacity-90" />

        <div className="max-w-3xl mx-auto relative">
          <img src={badgeTeaMagic} alt="Tea Magic" className="mx-auto w-32 md:w-40 mb-6 hover-wiggle" />
          <p className="font-marker text-2xl text-clover mb-3">our mission</p>
          <h2 className="text-4xl md:text-5xl font-display text-brown mb-6">
            Big love for little plants
          </h2>
          <Squiggle className="mx-auto w-40 text-clover mb-8" />
          <p className="text-lg md:text-xl leading-relaxed text-foreground/80">
            Kid Clover began in our backyard, in tiny hands and dirt-stained
            aprons. We blend gentle, kid-friendly herbal teas that are equal
            parts delicious and nourishing — and made to spark curiosity about
            the wild, wonderful world of plants.
          </p>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="font-marker text-2xl text-clover">our blends</p>
              <h2 className="text-4xl md:text-5xl font-display text-brown">
                Made for tiny taste buds
              </h2>
            </div>
            <Link to="/shop" className="font-marker text-xl text-clover hover:underline">
              shop all →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/shop"
                className="group block rounded-3xl overflow-hidden bg-card border-2 border-brown shadow-doodle hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-2xl text-brown leading-tight">
                    {p.name}
                  </h3>
                  <p className="font-marker text-lg text-clover">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="bg-lavender/30 py-24 px-6 relative overflow-hidden">
        <Sparkle className="absolute top-10 right-12 w-10 h-10 text-yellow-crayon animate-float" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="font-marker text-2xl text-clover">come find us</p>
              <h2 className="text-4xl md:text-5xl font-display text-brown">
                Upcoming events
              </h2>
            </div>
            <Link to="/events" className="font-marker text-xl text-clover hover:underline">
              full calendar →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcoming.map((e) => {
              const dt = new Date(e.date + "T00:00:00");
              return (
                <Link
                  key={e.id}
                  to="/events"
                  className="block bg-card border-2 border-brown rounded-3xl p-6 shadow-doodle hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-display text-5xl text-clover leading-none">
                      {dt.getDate()}
                    </span>
                    <span className="font-marker text-xl text-brown/70">
                      {dt.toLocaleString("en", { month: "short" })}
                    </span>
                  </div>
                  <p className="font-marker text-base text-orange-crayon mb-1">
                    {e.type}
                  </p>
                  <h3 className="font-display text-2xl text-brown leading-tight mb-2">
                    {e.title}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {e.time} · {e.location}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY TEASE */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-marker text-2xl text-clover">from our farms</p>
            <h2 className="text-4xl md:text-5xl font-display text-brown">
              Where the herbs come from
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-5 h-[280px] md:h-[420px]">
            {[galleryBush, galleryDesert, galleryCalendula].map((src, i) => (
              <Link
                key={i}
                to="/gallery"
                className="block overflow-hidden rounded-3xl border-2 border-brown shadow-doodle"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-brown shadow-doodle">
              <Link to="/gallery">See the gallery →</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
