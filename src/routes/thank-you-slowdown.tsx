import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/thank-you-slowdown")({
  head: () => ({
    meta: [
      { title: "Welcome to Kid Clover!" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouSlowdownPage,
});

function ThankYouSlowdownPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6">🌿</div>
        <p className="font-marker text-2xl text-clover mb-3">you're in!</p>
        <h1 className="font-display text-5xl text-brown mb-4">
          Thanks for joining us
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed mb-8">
          So glad you stopped by the Saturday Slowdown today! We love seeing familiar faces at the market and can't wait to see you again. Keep an eye on our{" "}
          <Link to="/events" className="text-clover hover:underline">
            events page
          </Link>{" "}
          for all our upcoming markets and pop-ups.
        </p>

        <div className="rounded-3xl border-2 border-dashed border-clover bg-clover/10 p-8 mb-8">
          <p className="font-marker text-base text-clover mb-2">your welcome gift</p>
          <p className="font-display text-4xl text-brown mb-1">10% off</p>
          <p className="text-sm text-foreground/60 mb-4">your next online order</p>
          <div className="bg-white rounded-xl border-2 border-brown px-6 py-3 inline-block">
            <span className="font-marker text-2xl text-brown tracking-widest">SLOWDOWN10</span>
          </div>
          <p className="text-xs text-foreground/50 mt-3">Enter this code at checkout on our website</p>
        </div>

        <Link
          to="/shop"
          className="inline-block font-marker text-xl text-brown border-2 border-brown rounded-full px-8 py-3 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
        >
          Shop our teas →
        </Link>
      </div>
    </div>
  );
}
