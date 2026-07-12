import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getSessionUser, type SessionUser } from "./session.server";

// Used by the admin layout route to decide what to render
export const getAdminStatus = createServerFn().handler(async (): Promise<{
  user: SessionUser | null;
  isAdmin: boolean;
}> => {
  const user = await getSessionUser();
  if (!user) return { user: null, isAdmin: false };

  const e = env as Cloudflare.Env;
  const row = await e.DB
    .prepare("SELECT 1 FROM admins WHERE user_id = ?")
    .bind(user.id)
    .first();

  return { user, isAdmin: row !== null };
});
