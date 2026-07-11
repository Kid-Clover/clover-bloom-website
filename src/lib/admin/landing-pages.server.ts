import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../admin.server";
import type { LandingPage } from "../landing-pages.server";

export type { LandingPage };

export type LandingPageInput = {
  id?: number;
  slug: string;
  title: string;
  subtitle?: string;
  icon?: string;
  body: string;
  coupon_code?: string;
  coupon_label?: string;
  coupon_amount?: string;
  coupon_description?: string;
  cta_text?: string;
  cta_url?: string;
};

export const adminGetAllLandingPages = createServerFn().handler(async () => {
  await requireAdmin();
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare("SELECT * FROM landing_pages ORDER BY created_at DESC")
    .all<LandingPage>();
  return results;
});

export const adminSaveLandingPage = createServerFn().handler(
  async ({ data }: { data: LandingPageInput }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    if (data.id) {
      await db
        .prepare(
          `UPDATE landing_pages SET
            slug = ?, title = ?, subtitle = ?, icon = ?, body = ?,
            coupon_code = ?, coupon_label = ?, coupon_amount = ?,
            coupon_description = ?, cta_text = ?, cta_url = ?
           WHERE id = ?`
        )
        .bind(
          data.slug, data.title, data.subtitle ?? null, data.icon ?? null, data.body,
          data.coupon_code ?? null, data.coupon_label ?? null, data.coupon_amount ?? null,
          data.coupon_description ?? null, data.cta_text ?? null, data.cta_url ?? null,
          data.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO landing_pages
            (slug, title, subtitle, icon, body, coupon_code, coupon_label,
             coupon_amount, coupon_description, cta_text, cta_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.slug, data.title, data.subtitle ?? null, data.icon ?? null, data.body,
          data.coupon_code ?? null, data.coupon_label ?? null, data.coupon_amount ?? null,
          data.coupon_description ?? null, data.cta_text ?? null, data.cta_url ?? null
        )
        .run();
    }
  }
);

export const adminDeleteLandingPage = createServerFn().handler(
  async ({ data }: { data: { id: number } }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM landing_pages WHERE id = ?").bind(data.id).run();
  }
);
