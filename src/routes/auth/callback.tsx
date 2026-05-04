import { createFileRoute, redirect } from "@tanstack/react-router";
import { handleAuthCallback } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/callback")({
  loader: async () => {
    await handleAuthCallback();
    throw redirect({ to: "/", statusCode: 302 });
  },
  component: () => null,
});
