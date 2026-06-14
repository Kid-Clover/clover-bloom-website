import { createFileRoute, Link } from "@tanstack/react-router";
import doodleCup from "@/assets/doodle-cup.png";

export const Route = createFileRoute("/thank-you-summer-2026-raffle")({
  head: () => ({
    meta: [
      { title: "You're entered! — Kid Clover" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouRafflePage,
});

function ThankYouRafflePage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6">🌿</div>
        <p className="font-marker text-2xl text-clover mb-3">you're in!</p>
        <h1 className="font-display text-5xl text-brown mb-4">
          Thanks for entering
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed mb-8">
          You're officially entered to win our <strong className="text-brown">Summer 2026 Tea Basket</strong>! We'll announce the winner soon — keep an eye on your inbox and follow along on Instagram for updates.
        </p>

        <div className="rounded-3xl border-2 border-dashed border-clover bg-clover/10 p-8 mb-8">
          <p className="font-marker text-base text-clover mb-2">the prize</p>
          <p className="font-display text-4xl text-brown mb-3">Summer 2026<br />Tea Basket</p>
          <p className="text-sm text-foreground/60 leading-relaxed">
            A curated collection of our favorite summer blends — perfect for iced teas, sun teas, and slow mornings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="inline-block font-marker text-xl text-brown border-2 border-brown rounded-full px-8 py-3 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
          >
            Shop our teas →
          </Link>
          <a
            href="https://www.instagram.com/drinkkidclover/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-marker text-xl text-clover border-2 border-clover rounded-full px-8 py-3 hover:bg-clover hover:text-cream transition-colors shadow-doodle"
          >
            Follow us →
          </a>
        </div>

        <img src={doodleCup} alt="" aria-hidden className="h-24 w-auto mt-16 mx-auto opacity-60" />
      </div>
    </div>
  );
}
