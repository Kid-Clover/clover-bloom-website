import { createAPIFileRoute } from "@tanstack/react-start/api";
import { env } from "cloudflare:workers";

type EventRow = {
  id: number;
  title: string;
  description: string | null;
  location_name: string;
  start_time: string;
  end_time: string | null;
};

function toICSDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

export const APIRoute = createAPIFileRoute("/api/calendar/$eventId")({
  GET: async ({ params }) => {
    const db = (env as Cloudflare.Env).DB;
    const event = await db
      .prepare(
        "SELECT id, title, description, location_name, start_time, end_time FROM events WHERE id = ?"
      )
      .bind(Number(params.eventId))
      .first<EventRow>();

    if (!event) return new Response("Not found", { status: 404 });

    const start = toICSDate(event.start_time);
    const end = event.end_time
      ? toICSDate(event.end_time)
      : toICSDate(new Date(new Date(event.start_time).getTime() + 60 * 60 * 1000).toISOString());
    const stamp = toICSDate(new Date().toISOString());
    const filename = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kid Clover//Events//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@drinkkidclover.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location_name}`,
      ...(event.description
        ? [`DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`]
        : []),
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return new Response(lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/calendar;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  },
});
