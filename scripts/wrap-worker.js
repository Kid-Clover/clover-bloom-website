#!/usr/bin/env node
// Post-build script: wraps the TanStack Start worker entry so that
// /api/calendar/:id is handled directly before React routing kicks in.
import { readFileSync, renameSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const serverDir = join(__dirname, "..", "dist", "server");
const indexPath = join(serverDir, "index.js");
const entryPath = join(serverDir, "_tanstack_entry.js");

renameSync(indexPath, entryPath);

const wrapper = `import { createServerEntry, default as tanstackHandler } from "./_tanstack_entry.js";
import "cloudflare:workers";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";

function toICSDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return \`\${d.getUTCFullYear()}\${p(d.getUTCMonth() + 1)}\${p(d.getUTCDate())}T\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}Z\`;
}

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\\/api\\/calendar\\/(\\d+)$/);

    if (m) {
      try {
        const eventId = parseInt(m[1], 10);
        const event = await env.DB.prepare(
          "SELECT id, title, description, location_name, start_time, end_time FROM events WHERE id = ?"
        ).bind(eventId).first();

        if (!event) return new Response("Not found", { status: 404 });

        const start = toICSDate(event.start_time);
        const end = event.end_time
          ? toICSDate(event.end_time)
          : toICSDate(new Date(new Date(event.start_time).getTime() + 3600000).toISOString());
        const stamp = toICSDate(new Date().toISOString());
        const filename = event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".ics";

        const lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Kid Clover//Events//EN",
          "BEGIN:VEVENT",
          \`UID:\${event.id}@drinkkidclover.com\`,
          \`DTSTAMP:\${stamp}\`,
          \`DTSTART:\${start}\`,
          \`DTEND:\${end}\`,
          \`SUMMARY:\${event.title}\`,
          \`LOCATION:\${event.location_name}\`,
        ];
        if (event.description) {
          lines.push(\`DESCRIPTION:\${event.description.replace(/\\n/g, "\\\\n")}\`);
        }
        lines.push("END:VEVENT", "END:VCALENDAR");

        return new Response(lines.join("\\r\\n"), {
          headers: {
            "Content-Type": "text/calendar;charset=utf-8",
            "Content-Disposition": \`attachment; filename="\${filename}"\`,
          },
        });
      } catch {
        return new Response("Internal error", { status: 500 });
      }
    }

    return tanstackHandler.fetch(request, env, ctx);
  },
};

export { createServerEntry };
export default worker;
`;

writeFileSync(indexPath, wrapper);
console.log("Worker wrapped with ICS handler at /api/calendar/:id");
