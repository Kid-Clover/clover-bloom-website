import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Auth0, generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import { setCookie, getCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getSessionUser, setSessionUser, clearSessionCookie, type SessionUser } from "./session.server";

export const getCurrentUser = createServerFn().handler(async (): Promise<SessionUser | null> => {
  return getSessionUser();
});

export const startLoginFlow = createServerFn().handler(async (): Promise<string> => {
  const request = getRequest();
  const e = env as Cloudflare.Env;
  const callbackUrl = new URL("/auth/callback", request.url).toString();
  const auth0 = new Auth0(e.AUTH0_DOMAIN, e.AUTH0_CLIENT_ID, e.AUTH0_CLIENT_SECRET, callbackUrl);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  setCookie("auth_state", state, cookieOpts);
  setCookie("auth_cv", codeVerifier, cookieOpts);

  return auth0.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]).toString();
});

export const handleAuthCallback = createServerFn().handler(async (): Promise<boolean> => {
  const request = getRequest();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const storedState = getCookie("auth_state");
  const codeVerifier = getCookie("auth_cv");

  if (!code || !returnedState || !storedState || !codeVerifier) return false;
  if (returnedState !== storedState) return false;

  try {
    const e = env as Cloudflare.Env;
    const callbackUrl = new URL("/auth/callback", request.url).toString();
    const auth0 = new Auth0(e.AUTH0_DOMAIN, e.AUTH0_CLIENT_ID, e.AUTH0_CLIENT_SECRET, callbackUrl);
    const tokens = await auth0.validateAuthorizationCode(code, codeVerifier);

    const claims = decodeIdToken(tokens.idToken()) as {
      sub: string; email: string; name?: string; picture?: string;
    };

    const db = e.DB;
    // If an email-only row exists (created via /join), merge auth0 data onto it
    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ? AND auth0_id IS NULL")
      .bind(claims.email)
      .first<{ id: number }>();

    if (existing) {
      await db
        .prepare(
          `UPDATE users SET auth0_id = ?, name = COALESCE(?, name), picture = ?
           WHERE id = ?`
        )
        .bind(claims.sub, claims.name ?? null, claims.picture ?? null, existing.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO users (auth0_id, email, name, picture) VALUES (?, ?, ?, ?)
           ON CONFLICT (auth0_id) DO UPDATE SET
             email = excluded.email, name = excluded.name, picture = excluded.picture`
        )
        .bind(claims.sub, claims.email, claims.name ?? null, claims.picture ?? null)
        .run();
    }

    const row = await db
      .prepare("SELECT id FROM users WHERE auth0_id = ?")
      .bind(claims.sub)
      .first<{ id: number }>();

    await setSessionUser({
      id: row!.id,
      auth0Id: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
      picture: claims.picture ?? null,
    });

    // Mailchimp: upsert member + apply "website" tag (best-effort)
    try {
      const [firstName, ...rest] = (claims.name ?? "").trim().split(" ");
      const lastName = rest.join(" ");
      const dc = e.MAILCHIMP_API_KEY.split("-")[1];
      const subscriberHash = await md5(claims.email.toLowerCase().trim());
      const authHeader = `Basic ${btoa(`anystring:${e.MAILCHIMP_API_KEY}`)}`;
      const listId = "e096feb89c";

      await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`,
        {
          method: "PUT",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({
            email_address: claims.email.toLowerCase().trim(),
            status_if_new: "subscribed",
            merge_fields: { FNAME: firstName, LNAME: lastName },
          }),
        }
      );

      await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`,
        {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ tags: [{ name: "website", status: "active" }] }),
        }
      );
    } catch {
      // non-fatal — login still succeeds
    }

    return true;
  } catch {
    return false;
  }
});

async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const startLogoutFlow = createServerFn().handler(async (): Promise<string> => {
  clearSessionCookie();
  const request = getRequest();
  const e = env as Cloudflare.Env;
  const returnTo = new URL("/", request.url).toString();
  return `https://${e.AUTH0_DOMAIN}/v2/logout?client_id=${e.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;
});
