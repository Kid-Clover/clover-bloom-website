import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { startLoginFlow } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/login")({
  validateSearch: z.object({ returnTo: z.string().optional() }),
  loader: async ({ search }) => {
    const url = await startLoginFlow({ data: { returnTo: search.returnTo } });
    throw redirect({ href: url, statusCode: 302 });
  },
  component: () => null,
});
