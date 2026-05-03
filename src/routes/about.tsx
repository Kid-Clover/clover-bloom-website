import { createFileRoute, Link } from "@tanstack/react-router";
import portrait from "@/assets/photo-clover.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kid Clover" },
      {
        name: "description",
        content:
          "Meet the herbalist mama behind Kid Clover. A story of farming, motherhood, and a love of plants.",
      },
      { property: "og:title", content: "About Kid Clover" },
      {
        property: "og:description",
        content: "The story behind our kid-friendly herbal teas.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="bg-paper">
      <header className="px-6 pt-20 pb-12 text-center max-w-3xl mx-auto relative">
        <p className="font-marker text-2xl text-clover mb-2">our story</p>
        <h1 className="text-5xl md:text-7xl font-display text-brown leading-tight">
          From garden, to cup, to little hands
        </h1>
      </header>

      <section className="px-6 py-12 max-w-5xl mx-auto grid md:grid-cols-5 gap-10 items-start">
        <div className="md:col-span-2">
          <div className="rounded-3xl overflow-hidden border-2 border-brown shadow-doodle">
            <img
              src={portrait}
              alt="A basket of freshly harvested herbs and flowers"
              className="w-full h-auto"
            />
          </div>
          <p className="font-marker text-xl text-center mt-4 text-clover">
            ✿ photo of the herbalist coming soon ✿
          </p>
        </div>

        <div className="md:col-span-3 space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>
            Hi! I'm the maker behind Kid Clover. Before the tea pouches and the
            farmers market booths, I was just a curious kid pulling clover from
            the lawn and tasting every leaf I could find. That curiosity grew
            up with me — through years of studying herbalism, working farms,
            and learning the slow magic of growing things.
          </p>
          <p>
            When I became a mom, everything shifted. I wanted my kids to feel
            the same wonder I did. To know that the chamomile in their bedtime
            cup once stood in the sun, that the mint in their iced tea was
            picked by hand. To grow up trusting plants as friends.
          </p>
          <p>
            So Kid Clover became the bridge: thoughtfully blended herbal teas,
            gentle enough for little bodies, joyful enough to feel like a
            ritual. Every blend is a tiny invitation to sit down, sip slow, and
            notice the world.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 bg-lavender/30 my-16 border-y-2 border-brown/20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-marker text-3xl md:text-4xl text-brown leading-snug">
            "Kids who know their plants grow up gentler with the world."
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-foreground/85">
        <h2 className="font-display text-4xl text-brown">What we believe</h2>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <Clover className="w-7 h-7 text-clover flex-shrink-0 mt-1" />
            <span><strong className="text-brown">Sourced with care.</strong> We work with small organic farms — many in our own backyard — to source every herb we use.</span>
          </li>
          <li className="flex gap-3">
            <Clover className="w-7 h-7 text-olive flex-shrink-0 mt-1" />
            <span><strong className="text-brown">Gentle by design.</strong> Every blend is formulated specifically for kids: low-tannin, naturally caffeine-free, and lightly sweet.</span>
          </li>
          <li className="flex gap-3">
            <Clover className="w-7 h-7 text-orange-crayon flex-shrink-0 mt-1" />
            <span><strong className="text-brown">Made to spark wonder.</strong> Our packaging, our classes, and our farmers market booths are all built to invite kids in.</span>
          </li>
        </ul>

        <div className="pt-6 flex flex-wrap gap-4">
          <Button asChild size="lg" className="rounded-full border-2 border-brown shadow-doodle">
            <Link to="/shop">Shop our teas</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-brown shadow-doodle">
            <Link to="/events">Come meet us</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
