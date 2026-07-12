import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

export type AdminCampaign = {
  id: number;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  tags: string | null;
  redirect_url: string | null;
  landing_page_id: number | null;
  landing_page_slug: string | null;
  created_at: string;
};

export type CampaignInput = {
  id?: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  tags?: string;
  redirect_url?: string;
  landing_page_id?: number;
};

export const adminGetAllCampaigns = createServerFn().handler(async () => {
  await requireAdmin();
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT c.id, c.title, c.subtitle, c.cta_text, c.tags, c.redirect_url,
              c.landing_page_id, lp.slug AS landing_page_slug, c.created_at
       FROM campaigns c
       LEFT JOIN landing_pages lp ON lp.id = c.landing_page_id
       ORDER BY c.created_at DESC`
    )
    .all<AdminCampaign>();
  return results;
});

export const adminSaveCampaign = createServerFn().handler(
  async ({ data }: { data: CampaignInput }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    if (data.id) {
      await db
        .prepare(
          `UPDATE campaigns
           SET title = ?, subtitle = ?, cta_text = ?, tags = ?,
               redirect_url = ?, landing_page_id = ?
           WHERE id = ?`
        )
        .bind(
          data.title,
          data.subtitle ?? null,
          data.cta_text ?? null,
          data.tags ?? null,
          data.redirect_url ?? null,
          data.landing_page_id ?? null,
          data.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO campaigns (title, subtitle, cta_text, tags, redirect_url, landing_page_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.title,
          data.subtitle ?? null,
          data.cta_text ?? null,
          data.tags ?? null,
          data.redirect_url ?? null,
          data.landing_page_id ?? null
        )
        .run();
    }
  }
);

export const adminDeleteCampaign = createServerFn().handler(
  async ({ data }: { data: { id: number } }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM campaigns WHERE id = ?").bind(data.id).run();
  }
);
