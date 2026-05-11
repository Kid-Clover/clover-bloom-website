import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { getUpcomingEvents, type KCEvent } from "@/lib/events.server";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin, Clock, X } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Kid Clover" },
      {
        name: "description",
        content:
          "Find Kid Clover at upcoming farmers markets, popups, and herbal classes for kids.",
      },
      { property: "og:title", content: "Kid Clover Events" },
      {
        property: "og:description",
        content: "Markets, popups, and kids' herbal classes.",
      },
    ],
  }),
  validateSearch: z.object({
    event: z.number().optional(),
  }),
  loader: () => getUpcomingEvents(),
  component: EventsPage,
});

const typeColor: Record<KCEvent["type"], string> = {
  Market: "bg-clover text-cream",
  Popup: "bg-orange-crayon text-cream",
  Class: "bg-blue-crayon text-cream",
  Appearance: "bg-olive text-cream",
};

function localDate(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString("en-CA"); // yyyy-mm-dd
}

function formatTimeRange(start: string, end: string | null): string {
  const fmt = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
      .toLowerCase();
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function EventsPage() {
  const events = Route.useLoaderData();
  const { event: eventId } = Route.useSearch();
  const navigate = useNavigate({ from: "/events" });
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [active, setActive] = useState<KCEvent | null>(null);

  useEffect(() => {
    if (eventId) {
      const found = events.find((e) => e.id === eventId) ?? null;
      setActive(found);
    }
  }, [eventId, events]);

  const openEvent = (e: KCEvent) => {
    setActive(e);
    navigate({ search: { event: e.id } });
  };

  const closeEvent = () => {
    setActive(null);
    navigate({ search: {} });
  };

  const days = useMemo(() => buildMonth(view.y, view.m), [view]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, KCEvent[]> = {};
    for (const e of events) {
      const key = localDate(e.start_time);
      (map[key] ||= []).push(e);
    }
    return map;
  }, [events]);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="bg-paper min-h-screen">
      <header className="px-6 pt-20 pb-10 text-center max-w-4xl mx-auto">
        <p className="font-marker text-2xl text-clover mb-2">come find us</p>
        <h1 className="text-5xl md:text-7xl font-display text-brown leading-tight">
          Where to meet Kid Clover
        </h1>
        <p className="mt-6 text-lg text-foreground/75 max-w-2xl mx-auto">
          Markets, popups, and hands-on classes for tiny plant lovers. Tap any
          event for details.
        </p>
      </header>

      <section className="px-4 md:px-6 pb-24 max-w-6xl mx-auto">
        <div className="bg-card border-2 border-brown rounded-3xl shadow-doodle p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="p-2 rounded-full hover:bg-muted border-2 border-brown"
            >
              <ChevronLeft />
            </button>
            <h2 className="font-display text-3xl md:text-4xl text-brown">
              {monthLabel}
            </h2>
            <button
              onClick={() => shift(1)}
              aria-label="Next month"
              className="p-2 rounded-full hover:bg-muted border-2 border-brown"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="font-marker text-center text-clover text-sm md:text-lg"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {days.map((day, i) => {
              const iso = day ? toISO(view.y, view.m, day) : "";
              const dayEvents = day ? eventsByDate[iso] || [] : [];
              const isToday =
                day &&
                view.y === today.getFullYear() &&
                view.m === today.getMonth() &&
                day === today.getDate();

              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[110px] rounded-xl p-1.5 md:p-2 border ${
                    day ? "bg-cream border-border" : "border-transparent"
                  } ${isToday ? "ring-2 ring-clover" : ""}`}
                >
                  {day && (
                    <>
                      <div className="text-xs md:text-sm font-bold text-brown mb-1">
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => openEvent(e)}
                            className={`w-full text-left text-[10px] md:text-xs px-1.5 py-1 rounded font-bold ${typeColor[e.type]} hover:opacity-90 transition-opacity truncate`}
                            title={e.title}
                          >
                            {e.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-3xl text-brown mb-6">All upcoming</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((e) => {
              const dt = new Date(e.start_time);
              return (
                <button
                  key={e.id}
                  onClick={() => openEvent(e)}
                  className="text-left bg-card border-2 border-brown rounded-2xl p-5 shadow-doodle hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center flex-shrink-0">
                      <div className="font-display text-4xl text-clover leading-none">
                        {dt.getDate()}
                      </div>
                      <div className="font-marker text-brown/70">
                        {dt.toLocaleString("en", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${typeColor[e.type]}`}
                      >
                        {e.type}
                      </span>
                      <h3 className="font-display text-2xl text-brown leading-tight mt-1">
                        {e.title}
                      </h3>
                      <p className="text-sm text-foreground/70 mt-1">
                        {formatTimeRange(e.start_time, e.end_time)} · {e.location_name}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && closeEvent()}>
        <DialogContent className="max-w-lg bg-card border-2 border-brown rounded-3xl [&>button]:hidden">
          {active && (
            <div className="relative">
              <button
                onClick={() => closeEvent()}
                className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <X size={22} />
              </button>
              <span
                className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${typeColor[active.type]}`}
              >
                {active.type}
              </span>
              <h2 className="font-display text-4xl text-brown leading-tight mt-2">
                {active.title}
              </h2>
              <p className="font-marker text-xl text-clover mt-1">
                {new Date(active.start_time).toLocaleDateString("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-clover" />
                  {formatTimeRange(active.start_time, active.end_time)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-clover flex-shrink-0" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.location_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-clover"
                  >
                    {active.location_name}
                  </a>
                </div>
              </div>

              <p className="mt-4 text-foreground/80 leading-relaxed">
                {active.description}
              </p>

              <div className={`mt-6 flex flex-col gap-3`}>
                {!!active.requires_sign_up && (
                  <Button
                    size="lg"
                    className="w-full rounded-full border-2 border-brown shadow-doodle"
                    onClick={() =>
                      alert(
                        "Sign-ups coming soon — login will be required to register for events."
                      )
                    }
                  >
                    Sign up
                  </Button>
                )}
                <button
                  onClick={() => addToCalendar(active)}
                  className="flex items-center justify-center gap-2 font-marker text-lg text-brown border-2 border-brown rounded-full px-4 py-2 hover:bg-brown hover:text-cream transition-colors shadow-doodle"
                >
                  <CalendarPlus size={18} />
                  Add to calendar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function toICSDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function addToCalendar(event: KCEvent) {
  const start = toICSDate(event.start_time);
  const end = event.end_time
    ? toICSDate(event.end_time)
    : toICSDate(new Date(new Date(event.start_time).getTime() + 60 * 60 * 1000).toISOString());
  const stamp = toICSDate(new Date().toISOString());
  const uid = `${event.id}@drinkkidclover.com`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kid Clover//Events//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location_name}`,
    ...(event.description ? [`DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildMonth(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toISO(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}
