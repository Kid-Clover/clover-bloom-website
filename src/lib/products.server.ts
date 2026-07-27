import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type ModifierOption = {
  productId: string;
  name: string;
  soldOut: boolean;
};

export type ModifierGroup = {
  requiredCount: number;
  options: ModifierOption[];
};

export type ProductVariation = {
  id: string;
  name: string;
  price: number; // dollars
  squareVariationId: string;
  soldOut: boolean;
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  price: number; // dollars
  squareUrl: string;
  squareVariationId: string;
  color: "clover" | "lavender" | "yellow-crayon" | "olive";
  imageKey: string;
  modifiers: ModifierGroup | null;
  soldOut: boolean;
  parentId: string | null;
  variations: ProductVariation[];
};

export const getProducts = createServerFn().handler(async (): Promise<Product[]> => {
  const db = (env as Cloudflare.Env).DB;

  const { results: rows } = await db
    .prepare(
      `SELECT id, name, tagline, description, ingredients, price_cents,
              square_url, square_variation_id, color, image_key, sold_out, parent_id
       FROM products WHERE active = 1 ORDER BY sort_order`
    )
    .all<{
      id: string;
      name: string;
      tagline: string;
      description: string;
      ingredients: string;
      price_cents: number;
      square_url: string;
      square_variation_id: string;
      color: "clover" | "lavender" | "yellow-crayon" | "olive";
      image_key: string;
      sold_out: number;
      parent_id: string | null;
    }>();

  const { results: modifierRows } = await db
    .prepare(
      `SELECT mg.product_id, mg.required_count, mo.option_product_id, p.name as option_name, p.sold_out
       FROM product_modifier_groups mg
       JOIN product_modifier_options mo ON mg.product_id = mo.product_id
       JOIN products p ON mo.option_product_id = p.id
       ORDER BY mg.product_id, p.sort_order`
    )
    .all<{
      product_id: string;
      required_count: number;
      option_product_id: string;
      option_name: string;
      sold_out: number;
    }>();

  const modifierMap = new Map<string, ModifierGroup>();
  for (const row of modifierRows) {
    if (!modifierMap.has(row.product_id)) {
      modifierMap.set(row.product_id, { requiredCount: row.required_count, options: [] });
    }
    modifierMap.get(row.product_id)!.options.push({
      productId: row.option_product_id,
      name: row.option_name,
      soldOut: row.sold_out === 1,
    });
  }

  const variationsByParent = new Map<string, ProductVariation[]>();
  for (const r of rows) {
    if (!r.parent_id) continue;
    const list = variationsByParent.get(r.parent_id) ?? [];
    list.push({
      id: r.id,
      name: r.name,
      price: r.price_cents / 100,
      squareVariationId: r.square_variation_id,
      soldOut: r.sold_out === 1,
    });
    variationsByParent.set(r.parent_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    ingredients: JSON.parse(r.ingredients) as string[],
    price: r.price_cents / 100,
    squareUrl: r.square_url,
    squareVariationId: r.square_variation_id,
    color: r.color,
    imageKey: r.image_key,
    modifiers: modifierMap.get(r.id) ?? null,
    soldOut: r.sold_out === 1,
    parentId: r.parent_id,
    variations: variationsByParent.get(r.id) ?? [],
  }));
});
