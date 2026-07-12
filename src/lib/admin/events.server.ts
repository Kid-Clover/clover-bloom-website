import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { requireAdmin } from "./require-admin.server";

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

export type SquareLocation = {
  id: string;
  name: string;
  label: string; // "Name — City, ST"
};

type SquareLocationRaw = {
  id: string;
  status?: string;
  name?: string;
  address?: {
    locality?: string;
    administrative_district_level_1?: string;
  };
};

export const adminGetSquareLocations = createServerFn().handler(async (): Promise<SquareLocation[]> => {
  await requireAdmin();
  const token = (env as Cloudflare.Env).SQUARE_ACCESS_TOKEN;

  const res = await fetch("https://connect.squareup.com/v2/locations", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": "2025-01-23",
    },
  });

  if (!res.ok) throw new Error(`Square API error: ${res.status}`);

  const body = await res.json() as { locations?: SquareLocationRaw[] };

  return (body.locations ?? [])
    .filter((l) => l.status === "ACTIVE")
    .map((l) => {
      const city = l.address?.locality;
      const state = l.address?.administrative_district_level_1;
      const suffix = [city, state].filter(Boolean).join(", ");
      return {
        id: l.id,
        name: l.name ?? l.id,
        label: suffix ? `${l.name ?? l.id} — ${suffix}` : (l.name ?? l.id),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

export const adminGetAllEvents = createServerFn().handler(async () => {
  await requireAdmin();
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
  await requireAdmin();
  const db = (env as Cloudflare.Env).DB;
  const { results } = await db
    .prepare("SELECT id, name FROM event_types ORDER BY name")
    .all<EventType>();
  return results;
});

export const adminSaveEvent = createServerFn().handler(
  async ({ data }: { data: EventInput }) => {
    await requireAdmin();
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
    await requireAdmin();
    const db = (env as Cloudflare.Env).DB;
    await db.prepare("DELETE FROM events WHERE id = ?").bind(data.id).run();
  }
);
