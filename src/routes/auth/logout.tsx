import { createFileRoute, redirect } from "@tanstack/react-router";
import { startLogoutFlow } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/logout")({
  loader: async () => {
    const url = await startLogoutFlow();
    throw redirect({ href: url, statusCode: 302 });
  },
  component: () => null,
});
