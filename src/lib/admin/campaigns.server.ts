import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type AdminCampaign = {
  id: number;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  tags: string | null;
  redirect_url: string | null;
  created_at: string;
};

export type CampaignInput = {
  id?: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  tags?: string;
  redirect_url?: string;
};

export const adminGetAllCampaigns = createServerFn().handler(async () => {
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT id, title, subtitle, cta_text, tags, redirect_url, created_at
       FROM campaigns
       ORDER BY created_at DESC`
    )
    .all<AdminCampaign>();
  return results;
});

export const adminSaveCampaign = createServerFn().handler(
  async ({ data }: { data: CampaignInput }) => {
    const db = (env as Cloudflare.Env).DB;
    if (data.id) {
      await db
        .prepare(
          `UPDATE campaigns
           SET title = ?, subtitle = ?, cta_text = ?, tags = ?, redirect_url = ?
           WHERE id = ?`
        )
        .bind(
          data.title,
          data.subtitle ?? null,
          data.cta_text ?? null,
          data.tags ?? null,
          data.redirect_url ?? null,
          data.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO campaigns (title, subtitle, cta_text, tags, redirect_url)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
          data.title,
          data.subtitle ?? null,
          data.cta_text ?? null,
          data.tags ?? null,
          data.redirect_url ?? null
        )
        .run();
    }
  }
);

export const adminDeleteCampaign = createServerFn().handler(
  async ({ data }: { data: { id: number } }) => {
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM campaigns WHERE id = ?").bind(data.id).run();
  }
);
