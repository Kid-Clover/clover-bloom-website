import { createFileRoute, redirect } from "@tanstack/react-router";
import { startLoginFlow } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/login")({
  loader: async () => {
    const url = await startLoginFlow();
    throw redirect({ href: url, statusCode: 302 });
  },
  component: () => null,
});
