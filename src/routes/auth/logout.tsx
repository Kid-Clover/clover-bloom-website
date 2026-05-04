import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { clearSessionCookie } from "@/lib/session.server";

export const Route = createFileRoute("/auth/logout")({
  loader: async () => {
    clearSessionCookie();

    const e = env as Cloudflare.Env;
    const request = getRequest();
    const returnTo = encodeURIComponent(new URL("/", request.url).toString());
    const logoutUrl = `https://${e.AUTH0_DOMAIN}/v2/logout?client_id=${e.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;

    throw redirect({ href: logoutUrl, statusCode: 302 });
  },
  component: () => null,
});
