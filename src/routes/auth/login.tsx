import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { startLoginFlow } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/login")({
  validateSearch: z.object({ returnTo: z.string().optional() }),
  loaderDeps: ({ search }) => ({ returnTo: search.returnTo }),
  loader: async ({ deps }) => {
    const url = await startLoginFlow({ data: { returnTo: deps.returnTo } });
    throw redirect({ href: url, statusCode: 302 });
  },
  component: () => null,
});
