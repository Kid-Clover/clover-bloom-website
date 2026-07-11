import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export type AdminEvent = {
  id: number;
  title: string;
  description: string | null;
  short_description: string | null;
  location_name: string;
  start_time: string;
  end_time: string | null;
  event_type_id: number;
  type: string;
  requires_sign_up: number;
  pickup_available: number;
  square_location_id: string | null;
};

export type EventType = { id: number; name: string };

export type EventInput = {
  id?: number;
  title: string;
  location_name: string;
  event_type_id: number;
  start_time: string;
  end_time?: string;
  short_description?: string;
  description?: string;
  requires_sign_up: boolean;
  pickup_available: boolean;
  square_location_id?: string;
};

export const adminGetAllEvents = createServerFn().handler(async () => {
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare(
      `SELECT e.id, e.title, e.description, e.short_description,
              e.location_name, e.start_time, e.end_time, e.event_type_id,
              e.requires_sign_up, e.pickup_available, e.square_location_id,
              et.name AS type
       FROM events e
       JOIN event_types et ON e.event_type_id = et.id
       ORDER BY e.start_time DESC`
    )
    .all<AdminEvent>();
  return results;
});

export const adminGetEventTypes = createServerFn().handler(async () => {
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare("SELECT id, name FROM event_types ORDER BY name")
    .all<EventType>();
  return results;
});

export const adminSaveEvent = createServerFn().handler(
  async ({ data }: { data: EventInput }) => {
    const db = (env as Cloudflare.Env).DB;
    if (data.id) {
      await db
        .prepare(
          `UPDATE events SET
            title = ?, location_name = ?, event_type_id = ?,
            start_time = ?, end_time = ?, short_description = ?,
            description = ?, requires_sign_up = ?, pickup_available = ?,
            square_location_id = ?
           WHERE id = ?`
        )
        .bind(
          data.title, data.location_name, data.event_type_id,
          data.start_time, data.end_time ?? null,
          data.short_description ?? null, data.description ?? null,
          data.requires_sign_up ? 1 : 0, data.pickup_available ? 1 : 0,
          data.square_location_id ?? null,
          data.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO events
            (title, location_name, event_type_id, start_time, end_time,
             short_description, description, requires_sign_up, pickup_available,
             square_location_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.title, data.location_name, data.event_type_id,
          data.start_time, data.end_time ?? null,
          data.short_description ?? null, data.description ?? null,
          data.requires_sign_up ? 1 : 0, data.pickup_available ? 1 : 0,
          data.square_location_id ?? null
        )
        .run();
    }
  }
);

export const adminDeleteEvent = createServerFn().handler(
  async ({ data }: { data: { id: number } }) => {
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM events WHERE id = ?").bind(data.id).run();
  }
);
