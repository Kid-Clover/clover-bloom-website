import { createFileRoute, Link } from "@tanstack/react-router";
import doodleCup from "@/assets/doodle-cup.png";

export const Route = createFileRoute("/thank-you-eno-river")({
  head: () => ({
    meta: [
      { title: "Welcome to Kid Clover!" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouEnoRiverPage,
});

function ThankYouEnoRiverPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6">🌿</div>
        <p className="font-marker text-2xl text-clover mb-3">you're in!</p>
        <h1 className="font-display text-5xl text-brown mb-4">
          Thanks for joining us
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed mb-8">
          So glad you stopped by the Eno River Farmers' Market today! We love seeing familiar faces and can't wait to see you again. Keep an eye on our{" "}
          <Link to="/events" className="text-clover hover:underline">
            events page
          </Link>{" "}
          for all our upcoming markets and pop-ups.
        </p>

        <Link
          to="/shop"
          className="inline-block font-marker text-xl text-brown border-2 border-brown rounded-full px-8 py-3 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
        >
          Shop our teas →
        </Link>

        <img src={doodleCup} alt="" aria-hidden className="h-32 w-auto mt-16 mx-auto opacity-60" />
      </div>
    </div>
  );
}
