import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type KCEvent = {
  id: number;
  title: string;
  description: string | null;
  short_description: string | null;
  location_name: string;
  start_time: string; // ISO 8601 UTC
  end_time: string | null; // ISO 8601 UTC
  type: "Market" | "Popup" | "Class" | "Appearance";
  requires_sign_up: number; // 0 | 1
};

export const getUpcomingEvents = createServerFn().handler(async () => {
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT
        e.id, e.title, e.description, e.short_description,
        e.location_name, e.start_time, e.end_time, e.requires_sign_up,
        et.name AS type
       FROM events e
       JOIN event_types et ON e.event_type_id = et.id
       WHERE e.start_time >= datetime('now')
       ORDER BY e.start_time`
    )
    .all<KCEvent>();
  return results;
});
