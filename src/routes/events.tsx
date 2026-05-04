import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getUpcomingEvents, type KCEvent } from "@/lib/events.server";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, MapPin, Clock, X } from "lucide-react";

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
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [active, setActive] = useState<KCEvent | null>(null);

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
                            onClick={() => setActive(e)}
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
                  onClick={() => setActive(e)}
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

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg bg-card border-2 border-brown rounded-3xl [&>button]:hidden">
          {active && (
            <div className="relative">
              <button
                onClick={() => setActive(null)}
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
                  <MapPin size={16} className="text-clover" />
                  {active.location_name}
                </div>
              </div>

              <p className="mt-4 text-foreground/80 leading-relaxed">
                {active.description}
              </p>

              {!!active.requires_sign_up && (
                <Button
                  size="lg"
                  className="mt-6 w-full rounded-full border-2 border-brown shadow-doodle"
                  onClick={() =>
                    alert(
                      "Sign-ups coming soon — login will be required to register for events."
                    )
                  }
                >
                  Sign up
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
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
