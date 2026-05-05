import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type ModifierOption = {
  productId: string;
  name: string;
};

export type ModifierGroup = {
  requiredCount: number;
  options: ModifierOption[];
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
};

export const getProducts = createServerFn().handler(async (): Promise<Product[]> => {
  const db = (env as Cloudflare.Env).DB;

  const { results: rows } = await db
    .prepare(
      `SELECT id, name, tagline, description, ingredients, price_cents,
              square_url, square_variation_id, color, image_key
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
    }>();

  const { results: modifierRows } = await db
    .prepare(
      `SELECT mg.product_id, mg.required_count, mo.option_product_id, p.name as option_name
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
    }>();

  const modifierMap = new Map<string, ModifierGroup>();
  for (const row of modifierRows) {
    if (!modifierMap.has(row.product_id)) {
      modifierMap.set(row.product_id, { requiredCount: row.required_count, options: [] });
    }
    modifierMap.get(row.product_id)!.options.push({
      productId: row.option_product_id,
      name: row.option_name,
    });
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
  }));
});
