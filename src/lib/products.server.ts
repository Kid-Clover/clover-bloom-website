import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  price: number; // dollars
  squareUrl: string;
  color: "clover" | "lavender" | "yellow-crayon" | "olive";
  imageKey: string;
};

export const getProducts = createServerFn().handler(async (): Promise<Product[]> => {
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT id, name, tagline, description, ingredients, price_cents,
              square_url, color, image_key
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
      color: "clover" | "lavender" | "yellow-crayon" | "olive";
      image_key: string;
    }>();

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    ingredients: JSON.parse(r.ingredients) as string[],
    price: r.price_cents / 100,
    squareUrl: r.square_url,
    color: r.color,
    imageKey: r.image_key,
  }));
});
