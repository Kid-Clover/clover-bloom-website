import { createFileRoute } from "@tanstack/react-router";
import { joinCommunity } from "@/lib/join.server";
import { getCampaign, type Campaign } from "@/lib/campaigns.server";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  campaign_id: z.coerce.number().optional(),
  tags: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/join")({
  validateSearch: searchSchema,
  loader: async ({ location }) => {
    const campaignId = (location.search as { campaign_id?: number }).campaign_id;
    if (!campaignId) return null;
    return getCampaign({ data: { id: campaignId } });
  },
  head: () => ({
    meta: [
      { title: "Join the Community — Kid Clover" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: JoinPage,
});

const DEFAULT_TITLE = "Join our community";
const DEFAULT_SUBTITLE = "stay in the loop";
const DEFAULT_BODY = "Get updates on new blends, upcoming events, and everything growing at Kid Clover.";

function JoinPage() {
  const campaign = Route.useLoaderData() as Campaign | null;
  const { tags, redirect } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const campaignTags = campaign?.tags
    ? campaign.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];
  const fallbackTags = tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
  const parsedTags = campaignTags.length > 0 ? campaignTags : fallbackTags;

  const redirectUrl = campaign?.redirect_url ?? redirect;

  const title = campaign?.title ?? DEFAULT_TITLE;
  const subtitle = campaign?.subtitle ?? DEFAULT_BODY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await joinCommunity({ data: { name, email, tags: parsedTags } });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setDone(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md w-full">
          <div className="text-6xl mb-6">🌿</div>
          <p className="font-marker text-2xl text-clover mb-3">you're in!</p>
          <h1 className="font-display text-5xl text-brown mb-4">
            Welcome to the community
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed">
            Thanks for joining, {name.split(" ")[0]}! We'll keep you in the loop on new blends, upcoming events, and all things Kid Clover.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full">
        <p className="font-marker text-2xl text-clover mb-2 text-center">{DEFAULT_SUBTITLE}</p>
        <h1 className="font-display text-5xl text-brown mb-3 text-center">
          {title}
        </h1>
        <p className="text-center text-foreground/70 mb-10 leading-relaxed">
          {subtitle}
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border-2 border-brown bg-card p-8 shadow-doodle space-y-5"
        >
          <div>
            <label htmlFor="name" className="block font-marker text-base text-brown mb-1">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
              required
              className="w-full rounded-xl border-2 border-brown/40 bg-paper px-4 py-3 font-body text-brown placeholder:text-brown/30 focus:border-clover focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-marker text-base text-brown mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border-2 border-brown/40 bg-paper px-4 py-3 font-body text-brown placeholder:text-brown/30 focus:border-clover focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full border-2 border-brown bg-clover text-cream font-marker text-xl shadow-doodle hover:bg-clover/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Joining…" : (campaign?.cta_text ?? "Join the community →")}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            No spam, ever. Unsubscribe any time.
          </p>
        </form>
      </div>
    </div>
  );
}
