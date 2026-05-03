import { createFileRoute, Link } from "@tanstack/react-router";
import portrait from "@/assets/photo-lesley.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kid Clover" },
      {
        name: "description",
        content:
          "Meet Lesley, the herbalist mama behind Kid Clover. A story of farming, motherhood, and a love of plants.",
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
        <p className="font-marker text-2xl text-clover mb-2">our mission</p>
        <h1 className="text-5xl md:text-7xl font-display text-brown leading-tight">
          From garden, to cup, to little hands
        </h1>
      </header>

      {/* MISSION STATEMENT */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="space-y-6 text-lg md:text-xl leading-relaxed text-foreground/85">
          <p>
            To nurture a love for plants, wellness, and creativity in children
            through our carefully crafted herbal tea blends. We believe in the
            magic of nature and the dreams of childhood, creating kid-friendly
            teas that are both delicious and nourishing.
          </p>
          <p>
            Our commitment extends beyond just the cup — through our interactive
            classes for parents and children, we empower families to make their
            own tea blends and explore the wonders of the natural world. With a
            focus on community, education, and sustainability, we aim to build a
            shared space where families can connect, learn, and grow together,
            one sip at a time.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 bg-lavender/30 border-y-2 border-brown/20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-marker text-3xl md:text-4xl text-brown leading-snug">
            "Kids who know their plants grow up gentler with the world."
          </p>
        </div>
      </section>

      {/* MEET LESLEY */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-marker text-2xl text-clover mb-2">meet the founder</p>
          <h2 className="text-4xl md:text-6xl font-display text-brown">
            Hi, I'm Lesley
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2 md:sticky md:top-28">
            <div className="rounded-3xl overflow-hidden border-2 border-brown shadow-doodle">
              <img
                src={portrait}
                alt="Lesley, founder of Kid Clover, in her hoop house with flowering herbs"
                className="w-full h-auto"
              />
            </div>
            <p className="font-marker text-xl text-center mt-4 text-clover">
              ✿ Lesley, in the hoop house ✿
            </p>
          </div>

          <div className="md:col-span-3 space-y-5 text-lg leading-relaxed text-foreground/85">
            <p>
              Eleven years ago I placed my hands in the soil at Montalbano Farm
              in Sandwich, Illinois and harvested the first carrots{" "}
              <em>(Daucus carota)</em>…of my life. I wish someone had been there
              to photograph the expression on my face! I felt exuberance,
              delight and disbelief. What a miracle to behold!
            </p>
            <p>
              I did not grow up gardening. Nor did I have an understanding of
              exactly where food and medicine come from. But in that one clear
              moment I understood that we are here to connect with plants and to
              better understand how they are here to teach, lead and feed our
              spirits.
            </p>
            <p>
              If carrots laid the foundation for my new
              experimentation//mindset//curiosity then mint{" "}
              <em>(Mentha peperita)</em> opened my mind to see the world with
              new eyes.
            </p>
            <p>
              I began to read about culinary herbs and quickly realized that
              their benefits expanded further than tomato sauce and lentil soup.
              Rosemary <em>(Rosmarinus officinalis)</em> could be used to make
              shampoo! Thyme <em>(Thymus vulgaris)</em> for cough syrup! Oats{" "}
              <em>(Avena sativa)</em> for itchy skin! My spice rack quickly
              became my herbal pharmacy and the empowerment I felt crafting my
              own remedies was real and lasting.
            </p>
            <p>
              Wondrous curiosity continued as I learned about wild edibles and
              medicinal plants from many wise women. The Midwest Women's Herbal
              Conference, The Chestnut School of Herbal Medicine, Herbalista and
              Moonwise Herbs added layers to my herbal understanding while I
              simultaneously learned about growing veggies through concrete laid
              soil beds at Windy City Harvest in Chicago, IL.
            </p>
            <p>
              Education has always been the backbone of my career. I've taught
              in kindergarten classrooms and urban farms, kitchens and forests.
              All ages. Always with an eye towards lifelong learning,
              kind-heartedness, respect for all, including the green world.
            </p>
            <p>
              Now I'm teaching children to ask before plucking the leaves off of
              a tree. Explaining the importance of honoring knowledge keepers:
              our elders, both plants and people. Emboldening youngsters to care
              about sacred soil; who has tended it and that which grows in and
              underneath.
            </p>
            <p>
              In 2003 I had a breakthrough. I imagined the layered lives of my
              ancestors. And it was from their lived experiences I felt a
              connection to and through the soil. I'm unsure if my family were
              farmers but something in me connected deeply to the earth the day
              I took root of those carrots.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-3xl mx-auto text-center">
        <div className="flex flex-wrap gap-4 justify-center">
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
