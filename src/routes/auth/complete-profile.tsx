import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { saveProfile, getProfileState } from "@/lib/profile.server";

export const Route = createFileRoute("/auth/complete-profile")({
  validateSearch: z.object({ returnTo: z.string().optional() }),
  loaderDeps: ({ search }) => ({ returnTo: search.returnTo }),
  loader: async ({ deps, location }) => {
    const state = await getProfileState();
    const returnTo = deps.returnTo ?? "/";
    if (state.status === "needs_login") {
      throw redirect({
        to: "/auth/login",
        search: { returnTo: (location.search as { returnTo?: string }).returnTo ?? "/" },
        statusCode: 302,
      });
    }
    if (state.status === "has_name") {
      throw redirect({ href: returnTo, statusCode: 302 });
    }
    return { email: state.email, returnTo };
  },
  head: () => ({
    meta: [{ title: "Complete Your Profile — Kid Clover" }],
  }),
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const { email, returnTo } = Route.useLoaderData();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveProfile({ data: { firstName, lastName } });
      navigate({ href: returnTo });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full">
        <p className="font-marker text-2xl text-clover mb-2 text-center">one quick thing</p>
        <h1 className="font-display text-5xl text-brown mb-3 text-center">
          What's your name?
        </h1>
        <p className="text-center text-foreground/70 mb-10 leading-relaxed">
          You're signed in as <span className="font-medium">{email}</span>. Tell us your name so we can greet you properly.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border-2 border-brown bg-card p-8 shadow-doodle space-y-5"
        >
          <div>
            <label htmlFor="firstName" className="block font-marker text-base text-brown mb-1">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Clover"
              required
              autoFocus
              className="w-full rounded-xl border-2 border-brown/40 bg-paper px-4 py-3 font-body text-brown placeholder:text-brown/30 focus:border-clover focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block font-marker text-base text-brown mb-1">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Bloom"
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
            {loading ? "Saving…" : "Continue →"}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            You can update this anytime from your profile.
          </p>
        </form>
      </div>
    </div>
  );
}
