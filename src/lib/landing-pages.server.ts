import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type LandingPage = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  body: string;
  coupon_code: string | null;
  coupon_label: string | null;
  coupon_amount: string | null;
  coupon_description: string | null;
  cta_text: string | null;
  cta_url: string | null;
  created_at: string;
};

export const getLandingPageBySlug = createServerFn().handler(
  async ({ data }: { data: { slug: string } }): Promise<LandingPage | null> => {
    const db = (env as Cloudflare.Env).DB;
    return db
      .prepare("SELECT * FROM landing_pages WHERE slug = ?")
      .bind(data.slug)
      .first<LandingPage>();
  }
);
