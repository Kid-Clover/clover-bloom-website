import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Link2, Check } from "lucide-react";
import {
  adminGetAllCampaigns, adminSaveCampaign, adminDeleteCampaign,
  type AdminCampaign,
} from "@/lib/admin/campaigns.server";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://drinkkidclover.com";

export const Route = createFileRoute("/admin/campaigns")({
  loader: async () => adminGetAllCampaigns(),
  component: AdminCampaigns,
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
      title="Copy signup link"
      className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
    </button>
  );
}

// ── form state ─────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  subtitle: string;
  cta_text: string;
  tags: string;
  redirect_url: string;
};

const BLANK: FormState = {
  title: "",
  subtitle: "",
  cta_text: "",
  tags: "",
  redirect_url: "",
};

function campaignToForm(c: AdminCampaign): FormState {
  return {
    title: c.title,
    subtitle: c.subtitle ?? "",
    cta_text: c.cta_text ?? "",
    tags: c.tags ?? "",
    redirect_url: c.redirect_url ?? "",
  };
}

// ── page ───────────────────────────────────────────────────────────────────

function AdminCampaigns() {
  const campaigns = Route.useLoaderData();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(BLANK);
    setSheetOpen(true);
  }

  function openEdit(c: AdminCampaign) {
    setEditingId(c.id);
    setForm(campaignToForm(c));
    setSheetOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveCampaign({
        data: {
          id: editingId ?? undefined,
          title: form.title,
          subtitle: form.subtitle || undefined,
          cta_text: form.cta_text || undefined,
          tags: form.tags || undefined,
          redirect_url: form.redirect_url || undefined,
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
      await adminDeleteCampaign({ data: { id: deleteTarget.id } });
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
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage marketing campaigns</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} />
          Add Campaign
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Redirect URL</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No campaigns yet — add one above.
                </td>
              </tr>
            ) : (
              campaigns.map((c: AdminCampaign) => {
                const tags = c.tags
                  ? c.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];
                const signupUrl = `${BASE_URL}/join?campaign_id=${c.id}`;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.title}</p>
                      {c.subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{c.subtitle}</p>
                      )}
                      {c.cta_text && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">"{c.cta_text}"</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tags.length === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {c.redirect_url ? (
                        <a
                          href={c.redirect_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {c.redirect_url.replace(/^https?:\/\/[^/]+/, "")}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <CopyButton text={signupUrl} />
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
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
            <SheetTitle>{editingId ? "Edit Campaign" : "Add Campaign"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-6 space-y-4 pr-1">

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                placeholder="Join our community"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle / Body Text</Label>
              <Textarea
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                rows={3}
                placeholder="Stay up to date on new blends, events, offers and more!"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cta_text">Button Text</Label>
              <Input
                id="cta_text"
                value={form.cta_text}
                onChange={(e) => set("cta_text", e.target.value)}
                placeholder="Join now"
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Defaults to "Join the community →" if left blank</p>
            </div>

            <div>
              <Label htmlFor="tags">
                Mailchimp Tags
                <span className="ml-1 text-xs text-gray-400 font-normal">(comma-separated)</span>
              </Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="eno-river-market, summer-2026"
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Applied to the subscriber in Mailchimp when they sign up via this campaign</p>
            </div>

            <div>
              <Label htmlFor="redirect_url">Redirect URL</Label>
              <Input
                id="redirect_url"
                value={form.redirect_url}
                onChange={(e) => set("redirect_url", e.target.value)}
                placeholder="https://drinkkidclover.com/thank-you-eno-river"
                className="mt-1 text-xs"
              />
              <p className="text-xs text-gray-400 mt-1">Where to send the user after they submit the form</p>
            </div>

            {editingId && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
                <p className="text-xs text-gray-500 mb-1">Signup link for this campaign</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-700 truncate flex-1">
                    {BASE_URL}/join?campaign_id={editingId}
                  </code>
                  <CopyButton text={`${BASE_URL}/join?campaign_id=${editingId}`} />
                </div>
              </div>
            )}

            <SheetFooter className="pt-4 pb-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Campaign"}
              </Button>
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
              This cannot be undone. Any signup links using this campaign ID will stop working.
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
