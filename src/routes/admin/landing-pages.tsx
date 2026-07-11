import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Link2, Check } from "lucide-react";
import {
  adminGetAllLandingPages, adminSaveLandingPage, adminDeleteLandingPage,
  type LandingPage,
} from "@/lib/admin/landing-pages.server";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://drinkkidclover.com";

export const Route = createFileRoute("/admin/landing-pages")({
  loader: async () => adminGetAllLandingPages(),
  component: AdminLandingPages,
});

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      title="Copy page URL"
      className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
    </button>
  );
}

// ── form state ─────────────────────────────────────────────────────────────

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  body: string;
  coupon_code: string;
  coupon_label: string;
  coupon_amount: string;
  coupon_description: string;
  cta_text: string;
  cta_url: string;
};

const BLANK: FormState = {
  slug: "", title: "", subtitle: "", icon: "", body: "",
  coupon_code: "", coupon_label: "", coupon_amount: "", coupon_description: "",
  cta_text: "", cta_url: "",
};

function pageToForm(p: LandingPage): FormState {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? "",
    icon: p.icon ?? "",
    body: p.body,
    coupon_code: p.coupon_code ?? "",
    coupon_label: p.coupon_label ?? "",
    coupon_amount: p.coupon_amount ?? "",
    coupon_description: p.coupon_description ?? "",
    cta_text: p.cta_text ?? "",
    cta_url: p.cta_url ?? "",
  };
}

// ── page ───────────────────────────────────────────────────────────────────

function AdminLandingPages() {
  const pages = Route.useLoaderData();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(BLANK);
    setSheetOpen(true);
  }

  function openEdit(p: LandingPage) {
    setEditingId(p.id);
    setForm(pageToForm(p));
    setSheetOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveLandingPage({
        data: {
          id: editingId ?? undefined,
          slug: form.slug,
          title: form.title,
          subtitle: form.subtitle || undefined,
          icon: form.icon || undefined,
          body: form.body,
          coupon_code: form.coupon_code || undefined,
          coupon_label: form.coupon_label || undefined,
          coupon_amount: form.coupon_amount || undefined,
          coupon_description: form.coupon_description || undefined,
          cta_text: form.cta_text || undefined,
          cta_url: form.cta_url || undefined,
        },
      });
      setSheetOpen(false);
      await router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteLandingPage({ data: { id: deleteTarget.id } });
      setDeleteTarget(null);
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
          <h1 className="text-2xl font-semibold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Build custom pages for campaigns and events</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} />
          Add Landing Page
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Page</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Coupon</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">CTA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No landing pages yet — add one above.
                </td>
              </tr>
            ) : (
              pages.map((p: LandingPage) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.icon && <span>{p.icon}</span>}
                      <p className="font-medium text-gray-900">{p.title}</p>
                    </div>
                    {p.subtitle && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">"{p.subtitle}"</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.slug}</td>
                  <td className="px-4 py-3">
                    {p.coupon_code ? (
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">
                        {p.coupon_code}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.cta_text || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <CopyButton text={`${BASE_URL}/lp/${p.slug}`} />
                      <a
                        href={`/lp/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Preview page"
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Landing Page" : "Add Landing Page"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-6 space-y-4 pr-1">

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor="slug">
                  Slug *
                  <span className="ml-1 text-xs text-gray-400 font-normal">(/lp/your-slug)</span>
                </Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    set("slug", slug);
                  }}
                  required
                  placeholder="eno-river-summer-2026"
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(e) => set("icon", e.target.value)}
                  placeholder="🌿"
                  className="mt-1 text-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder="you're in!"
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Marker text shown above the title</p>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                  placeholder="Thanks for joining us"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="body">Body Text *</Label>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                required
                rows={3}
                placeholder="So glad you stopped by today! Keep an eye on our events page for upcoming markets."
                className="mt-1"
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Coupon (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="coupon_label">Label</Label>
                  <Input id="coupon_label" value={form.coupon_label} onChange={(e) => set("coupon_label", e.target.value)} placeholder="your welcome gift" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="coupon_amount">Amount</Label>
                  <Input id="coupon_amount" value={form.coupon_amount} onChange={(e) => set("coupon_amount", e.target.value)} placeholder="10% off" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="coupon_description">Description</Label>
                  <Input id="coupon_description" value={form.coupon_description} onChange={(e) => set("coupon_description", e.target.value)} placeholder="your next online order" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="coupon_code">Code</Label>
                  <Input id="coupon_code" value={form.coupon_code} onChange={(e) => set("coupon_code", e.target.value.toUpperCase())} placeholder="SUMMER10" className="mt-1 font-mono" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Call to Action (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cta_text">Button Text</Label>
                  <Input id="cta_text" value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} placeholder="Shop our teas →" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cta_url">Button URL</Label>
                  <Input id="cta_url" value={form.cta_url} onChange={(e) => set("cta_url", e.target.value)} placeholder="/shop" className="mt-1" />
                </div>
              </div>
            </div>

            {editingId && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
                <p className="text-xs text-gray-500 mb-1">Live URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-700 truncate flex-1">
                    {BASE_URL}/lp/{form.slug}
                  </code>
                  <CopyButton text={`${BASE_URL}/lp/${form.slug}`} />
                </div>
              </div>
            )}

            <SheetFooter className="pt-4 pb-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Page"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Any campaigns pointing to /lp/{deleteTarget?.slug} will have a broken redirect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
