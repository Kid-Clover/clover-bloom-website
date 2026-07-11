import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getLandingPageBySlug } from "@/lib/landing-pages.server";
import doodleCup from "@/assets/doodle-cup.png";

export const Route = createFileRoute("/lp/$slug")({
  head: () => ({
    meta: [
      { title: "Welcome to Kid Clover!" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async ({ params }) => {
    const page = await getLandingPageBySlug({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  component: LandingPageRoute,
});

function LandingPageRoute() {
  const page = Route.useLoaderData();
  const hasCoupon = Boolean(page.coupon_code);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md w-full">

        {page.icon && (
          <div className="text-6xl mb-6">{page.icon}</div>
        )}

        {page.subtitle && (
          <p className="font-marker text-2xl text-clover mb-3">{page.subtitle}</p>
        )}

        <h1 className="font-display text-5xl text-brown mb-4">{page.title}</h1>

        <p className="text-lg text-foreground/70 leading-relaxed mb-8">{page.body}</p>

        {hasCoupon && (
          <div className="rounded-3xl border-2 border-dashed border-clover bg-clover/10 p-8 mb-8">
            {page.coupon_label && (
              <p className="font-marker text-base text-clover mb-2">{page.coupon_label}</p>
            )}
            {page.coupon_amount && (
              <p className="font-display text-4xl text-brown mb-1">{page.coupon_amount}</p>
            )}
            {page.coupon_description && (
              <p className="text-sm text-foreground/60 mb-4">{page.coupon_description}</p>
            )}
            <div className="bg-white rounded-xl border-2 border-brown px-6 py-3 inline-block">
              <span className="font-marker text-2xl text-brown tracking-widest">
                {page.coupon_code}
              </span>
            </div>
            <p className="text-xs text-foreground/50 mt-3">
              Enter this code at checkout on our website
            </p>
          </div>
        )}

        {page.cta_text && page.cta_url && (
          <a
            href={page.cta_url}
            className="inline-block font-marker text-xl text-brown border-2 border-brown rounded-full px-8 py-3 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
          >
            {page.cta_text}
          </a>
        )}

        <img
          src={doodleCup}
          alt=""
          aria-hidden
          className="h-32 w-auto mt-16 mx-auto opacity-60"
        />
      </div>
    </div>
  );
}
