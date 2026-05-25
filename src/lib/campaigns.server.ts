import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type Campaign = {
  id: number;
  title: string;
  subtitle: string | null;
  tags: string | null;
  redirect_url: string | null;
  cta_text: string | null;
};

export const getCampaign = createServerFn()
  .handler(async ({ data }: { data: { id: number } }): Promise<Campaign | null> => {
    const e = env as Cloudflare.Env;
    return e.DB
      .prepare("SELECT id, title, subtitle, tags, redirect_url, cta_text FROM campaigns WHERE id = ?")
      .bind(data.id)
      .first<Campaign>();
  });
