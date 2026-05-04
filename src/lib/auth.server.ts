import { createServerFn } from "@tanstack/react-start";
import { Auth0, generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import { setCookie, getCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getSessionUser, setSessionUser, type SessionUser } from "./session.server";

export { generateState, generateCodeVerifier, decodeIdToken };

export function createAuth0Client(callbackUrl: string): Auth0 {
  const e = env as Cloudflare.Env;
  return new Auth0(e.AUTH0_DOMAIN, e.AUTH0_CLIENT_ID, e.AUTH0_CLIENT_SECRET, callbackUrl);
}

export function setOAuthCookies(state: string, codeVerifier: string): void {
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  setCookie("auth_state", state, opts);
  setCookie("auth_cv", codeVerifier, opts);
}

export function getOAuthCookies(): { state: string | undefined; codeVerifier: string | undefined } {
  return { state: getCookie("auth_state"), codeVerifier: getCookie("auth_cv") };
}

export async function upsertUser(
  auth0Id: string,
  email: string,
  name: string | null,
  picture: string | null
): Promise<number> {
  const db = (env as Cloudflare.Env).DB;
  await db
    .prepare(
      `INSERT INTO users (auth0_id, email, name, picture)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (auth0_id) DO UPDATE SET
         email   = excluded.email,
         name    = excluded.name,
         picture = excluded.picture`
    )
    .bind(auth0Id, email, name, picture)
    .run();
  const row = await db
    .prepare("SELECT id FROM users WHERE auth0_id = ?")
    .bind(auth0Id)
    .first<{ id: number }>();
  return row!.id;
}

export function getAuth0LogoutUrl(returnTo: string): string {
  const e = env as Cloudflare.Env;
  return `https://${e.AUTH0_DOMAIN}/v2/logout?client_id=${e.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;
}

export { setSessionUser };

export const getCurrentUser = createServerFn().handler(async (): Promise<SessionUser | null> => {
  return getSessionUser();
});
