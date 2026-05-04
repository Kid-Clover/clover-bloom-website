import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { clearSessionCookie } from "@/lib/session.server";
import { getAuth0LogoutUrl } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/logout")({
  loader: async () => {
    clearSessionCookie();

    const request = getRequest();
    const returnTo = new URL("/", request.url).toString();
    const logoutUrl = getAuth0LogoutUrl(returnTo);

    throw redirect({ href: logoutUrl, statusCode: 302 });
  },
  component: () => null,
});
