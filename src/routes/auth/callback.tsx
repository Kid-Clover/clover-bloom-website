import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import {
  createAuth0Client,
  getOAuthCookies,
  decodeIdToken,
  upsertUser,
  setSessionUser,
} from "@/lib/auth.server";

export const Route = createFileRoute("/auth/callback")({
  loader: async () => {
    const request = getRequest();
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");

    const { state: storedState, codeVerifier } = getOAuthCookies();

    if (!code || !returnedState || !storedState || !codeVerifier) {
      throw redirect({ to: "/", statusCode: 302 });
    }
    if (returnedState !== storedState) {
      throw redirect({ to: "/", statusCode: 302 });
    }

    try {
      const callbackUrl = new URL("/auth/callback", request.url).toString();
      const auth0 = createAuth0Client(callbackUrl);
      const tokens = await auth0.validateAuthorizationCode(code, codeVerifier);

      const claims = decodeIdToken(tokens.idToken()) as {
        sub: string;
        email: string;
        name?: string;
        picture?: string;
      };

      const db = (env as Cloudflare.Env).DB;
      const userId = await upsertUser(
        db,
        claims.sub,
        claims.email,
        claims.name ?? null,
        claims.picture ?? null
      );

      await setSessionUser({
        id: userId,
        auth0Id: claims.sub,
        email: claims.email,
        name: claims.name ?? null,
        picture: claims.picture ?? null,
      });
    } catch {
      throw redirect({ to: "/", statusCode: 302 });
    }

    throw redirect({ to: "/", statusCode: 302 });
  },
  component: () => null,
});
