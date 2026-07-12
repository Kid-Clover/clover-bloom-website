import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

export type AdminProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string; // raw JSON — parse on client
  price_cents: number;
  square_url: string;
  square_variation_id: string | null;
  color: "clover" | "lavender" | "yellow-crayon" | "olive";
  image_key: string;
  sort_order: number;
  active: number;
  sold_out: number;
};

export type ProductInput = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[]; // array — server serialises to JSON
  price_cents: number;
  square_url: string;
  square_variation_id?: string;
  color: string;
  image_key: string;
  sort_order: number;
  active: boolean;
  sold_out: boolean;
  isNew: boolean; // true = INSERT, false = UPDATE
};

export const adminGetAllProducts = createServerFn().handler(async () => {
  await requireAdmin();
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT id, name, tagline, description, ingredients, price_cents,
              square_url, square_variation_id, color, image_key,
              sort_order, active, sold_out
       FROM products
       ORDER BY sort_order, name`
    )
    .all<AdminProduct>();
  return results;
});

export const adminSaveProduct = createServerFn().handler(
  async ({ data }: { data: ProductInput }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    const ingredients = JSON.stringify(data.ingredients);

    if (data.isNew) {
      await db
        .prepare(
          `INSERT INTO products
            (id, name, tagline, description, ingredients, price_cents,
             square_url, square_variation_id, color, image_key,
             sort_order, active, sold_out)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.id, data.name, data.tagline, data.description, ingredients,
          data.price_cents, data.square_url, data.square_variation_id ?? null,
          data.color, data.image_key,
          data.sort_order, data.active ? 1 : 0, data.sold_out ? 1 : 0
        )
        .run();
    } else {
      await db
        .prepare(
          `UPDATE products SET
            name = ?, tagline = ?, description = ?, ingredients = ?,
            price_cents = ?, square_url = ?, square_variation_id = ?,
            color = ?, image_key = ?, sort_order = ?, active = ?, sold_out = ?
           WHERE id = ?`
        )
        .bind(
          data.name, data.tagline, data.description, ingredients,
          data.price_cents, data.square_url, data.square_variation_id ?? null,
          data.color, data.image_key,
          data.sort_order, data.active ? 1 : 0, data.sold_out ? 1 : 0,
          data.id
        )
        .run();
    }
  }
);

export type SquareCatalogVariation = {
  variationId: string;
  itemName: string;
  variationName: string;
};

type SquareCatalogObject = {
  id: string;
  type: string;
  item_data?: {
    name?: string;
    variations?: Array<{
      id: string;
      item_variation_data?: { name?: string };
    }>;
  };
};

export const adminGetSquareCatalogVariations = createServerFn().handler(async (): Promise<SquareCatalogVariation[]> => {
  await requireAdmin();
  const token = (env as Cloudflare.Env).SQUARE_ACCESS_TOKEN;
  const variations: SquareCatalogVariation[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL("https://connect.squareup.com/v2/catalog/list");
    url.searchParams.set("types", "ITEM");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": "2025-01-23",
      },
    });

    if (!res.ok) throw new Error(`Square API error: ${res.status}`);

    const body = await res.json() as { objects?: SquareCatalogObject[]; cursor?: string };
    cursor = body.cursor;

    for (const item of body.objects ?? []) {
      const itemName = item.item_data?.name ?? "Unknown";
      for (const v of item.item_data?.variations ?? []) {
        variations.push({
          variationId: v.id,
          itemName,
          variationName: v.item_variation_data?.name ?? "Regular",
        });
      }
    }
  } while (cursor);

  return variations.sort((a, b) => a.itemName.localeCompare(b.itemName));
});

export const adminDeleteProduct = createServerFn().handler(
  async ({ data }: { data: { id: string } }) => {
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM products WHERE id = ?").bind(data.id).run();
  }
);
