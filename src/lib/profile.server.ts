import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getSessionUser, setSessionUser } from "./session.server";

export type ProfileState =
  | { status: "needs_login" }
  | { status: "has_name" }
  | { status: "needs_name"; email: string };

export const getProfileState = createServerFn().handler(async (): Promise<ProfileState> => {
  const user = await getSessionUser();
  if (!user) return { status: "needs_login" };
  const hasName = user.name && user.name.toLowerCase() !== user.email.toLowerCase();
  if (hasName) return { status: "has_name" };
  return { status: "needs_name", email: user.email };
});

export const saveProfile = createServerFn().handler(
  async ({ data }: { data: { firstName: string; lastName: string } }): Promise<void> => {
    const user = await getSessionUser();
    if (!user) throw new Error("Not logged in");
    const name = [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(" ");
    if (!name) throw new Error("Name is required");
    const e = env as Cloudflare.Env;
    await e.DB
      .prepare("UPDATE users SET name = ? WHERE id = ?")
      .bind(name, user.id)
      .run();
    await setSessionUser({ ...user, name });
  }
);
