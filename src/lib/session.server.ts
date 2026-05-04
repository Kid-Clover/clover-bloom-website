import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

export type SessionUser = {
  id: number;
  auth0Id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

async function sign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verify(data: string, sig: string, secret: string): Promise<boolean> {
  return (await sign(data, secret)) === sig;
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const secret = (env as Cloudflare.Env).SESSION_SECRET;
  const payload = btoa(JSON.stringify(user));
  const sig = await sign(payload, secret);
  setCookie("kc_session", `${payload}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const secret = (env as Cloudflare.Env).SESSION_SECRET;
  const value = getCookie("kc_session");
  if (!value) return null;
  try {
    const dot = value.lastIndexOf(".");
    const payload = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    if (!payload || !sig) return null;
    if (!(await verify(payload, sig, secret))) return null;
    return JSON.parse(atob(payload)) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSessionCookie(): void {
  deleteCookie("kc_session");
}
