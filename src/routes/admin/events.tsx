import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  adminGetAllEvents, adminGetEventTypes, adminSaveEvent, adminDeleteEvent,
  adminGetSquareLocations,
  type AdminEvent, type EventType, type SquareLocation,
} from "@/lib/admin/events.server";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/events")({
  loader: async () => {
    const [events, eventTypes] = await Promise.all([
      adminGetAllEvents(),
      adminGetEventTypes(),
    ]);
    return { events, eventTypes };
  },
  component: AdminEvents,
});

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── form state ─────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  location_name: string;
  event_type_id: string;
  start_time: string;
  end_time: string;
  short_description: string;
  description: string;
  requires_sign_up: boolean;
  pickup_available: boolean;
  square_location_id: string;
};

const BLANK: FormState = {
  title: "",
  location_name: "",
  event_type_id: "1",
  start_time: "",
  end_time: "",
  short_description: "",
  description: "",
  requires_sign_up: false,
  pickup_available: false,
  square_location_id: "",
};

function eventToForm(e: AdminEvent): FormState {
  return {
    title: e.title,
    location_name: e.location_name,
    event_type_id: String(e.event_type_id),
    start_time: toDatetimeLocal(e.start_time),
    end_time: e.end_time ? toDatetimeLocal(e.end_time) : "",
    short_description: e.short_description ?? "",
    description: e.description ?? "",
    requires_sign_up: Boolean(e.requires_sign_up),
    pickup_available: Boolean(e.pickup_available),
    square_location_id: e.square_location_id ?? "",
  };
}

// ── page ───────────────────────────────────────────────────────────────────

function AdminEvents() {
  const { events, eventTypes } = Route.useLoaderData();
  const router = useRouter();
  const now = new Date();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [squareLocations, setSquareLocations] = useState<SquareLocation[] | null>(null);
  const [locationsLoading, setLocationsLoading] = useState(false);

  useEffect(() => {
    if (!sheetOpen || squareLocations !== null || locationsLoading) return;
    setLocationsLoading(true);
    adminGetSquareLocations()
      .then(setSquareLocations)
      .catch(() => setSquareLocations([]))
      .finally(() => setLocationsLoading(false));
  }, [sheetOpen]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...BLANK, event_type_id: String(eventTypes[0]?.id ?? "1") });
    setSheetOpen(true);
  }

  function openEdit(event: AdminEvent) {
    setEditingId(event.id);
    setForm(eventToForm(event));
    setSheetOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveEvent({
        data: {
          id: editingId ?? undefined,
          title: form.title,
          location_name: form.location_name,
          event_type_id: Number(form.event_type_id),
          start_time: new Date(form.start_time).toISOString(),
          end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
          short_description: form.short_description || undefined,
          description: form.description || undefined,
          requires_sign_up: form.requires_sign_up,
          pickup_available: form.pickup_available,
          square_location_id: form.square_location_id || undefined,
        },
      });
      setSheetOpen(false);
      await router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await adminDeleteEvent({ data: { id: deleteId } });
      setDeleteId(null);
      await router.invalidate();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage markets, pop-ups, and other events</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} />
          Add Event
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Start</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Flags</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No events yet — add one above.
                </td>
              </tr>
            ) : (
              events.map((event: AdminEvent) => {
                const isPast = new Date(event.start_time) < now;
                return (
                  <tr key={event.id} className={isPast ? "opacity-45" : ""}>
                    <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                    <td className="px-4 py-3 text-gray-600">{event.location_name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(event.start_time)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-1">
                      {Boolean(event.requires_sign_up) && (
                        <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">Sign-up</span>
                      )}
                      {Boolean(event.pickup_available) && (
                        <span className="text-xs bg-green-50 text-green-700 rounded px-1.5 py-0.5">Pickup</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(event)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Event" : "Add Event"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-6 space-y-4 pr-1">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="location_name">Location *</Label>
                <Input
                  id="location_name"
                  value={form.location_name}
                  onChange={(e) => set("location_name", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event_type">Type *</Label>
                <Select
                  value={form.event_type_id}
                  onValueChange={(v) => set("event_type_id", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((et: EventType) => (
                      <SelectItem key={et.id} value={String(et.id)}>
                        {et.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => set("start_time", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => set("end_time", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                rows={2}
                placeholder="Shown on event cards and listings"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Shown on the event detail page"
                className="mt-1"
              />
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_sign_up"
                  checked={form.requires_sign_up}
                  onCheckedChange={(v) => set("requires_sign_up", Boolean(v))}
                />
                <Label htmlFor="requires_sign_up" className="font-normal cursor-pointer">
                  Requires sign-up
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pickup_available"
                  checked={form.pickup_available}
                  onCheckedChange={(v) => set("pickup_available", Boolean(v))}
                />
                <Label htmlFor="pickup_available" className="font-normal cursor-pointer">
                  Pickup available at this event
                </Label>
              </div>
            </div>

            {form.pickup_available && (
              <div>
                <Label htmlFor="square_location_id">Business Location</Label>
                {locationsLoading ? (
                  <div className="mt-1 flex items-center gap-2 h-9 px-3 border border-input rounded-md text-sm text-muted-foreground">
                    <Loader2 size={13} className="animate-spin" />
                    Loading Square locations…
                  </div>
                ) : squareLocations && squareLocations.length > 0 ? (
                  <Select
                    value={form.square_location_id || "__none__"}
                    onValueChange={(v) => set("square_location_id", v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a location…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="text-muted-foreground">— None —</SelectItem>
                      {squareLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="square_location_id"
                    value={form.square_location_id}
                    onChange={(e) => set("square_location_id", e.target.value)}
                    placeholder="Square location ID for pickup orders"
                    className="mt-1"
                  />
                )}
              </div>
            )}

            <SheetFooter className="pt-4 pb-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Event"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
