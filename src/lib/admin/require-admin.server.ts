import { env } from "cloudflare:workers";
import { getSessionUser, type SessionUser } from "../session.server";

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const e = env as Cloudflare.Env;
  const row = await e.DB
    .prepare("SELECT 1 FROM admins WHERE user_id = ?")
    .bind(user.id)
    .first();
  if (!row) throw new Error("Forbidden");

  return user;
}
