import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
  component: ShopPage,
});

function ShopPage() {
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
