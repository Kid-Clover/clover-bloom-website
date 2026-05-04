import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import {
  createAuth0Client,
  generateState,
  generateCodeVerifier,
  setOAuthCookies,
} from "@/lib/auth.server";

export const Route = createFileRoute("/auth/login")({
  loader: async () => {
    const request = getRequest();
    const callbackUrl = new URL("/auth/callback", request.url).toString();
    const auth0 = createAuth0Client(callbackUrl);

    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    setOAuthCookies(state, codeVerifier);

    const url = auth0.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    throw redirect({ href: url.toString(), statusCode: 302 });
  },
  component: () => null,
});
