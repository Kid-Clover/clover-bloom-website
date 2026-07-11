import { createFileRoute, redirect } from "@tanstack/react-router";
import { handleAuthCallback } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/callback")({
  loader: async () => {
    const returnTo = await handleAuthCallback();
    throw redirect({ href: returnTo, statusCode: 302 });
  },
  component: () => null,
});
