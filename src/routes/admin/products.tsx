import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  adminGetAllProducts, adminSaveProduct, adminDeleteProduct,
  type AdminProduct,
} from "@/lib/admin/products.server";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/products")({
  loader: async () => adminGetAllProducts(),
  component: AdminProducts,
});

// ── constants ──────────────────────────────────────────────────────────────

const COLORS = [
  { value: "clover",        label: "Clover",       dot: "bg-pink-500" },
  { value: "lavender",      label: "Lavender",     dot: "bg-purple-400" },
  { value: "yellow-crayon", label: "Yellow Crayon",dot: "bg-yellow-400" },
  { value: "olive",         label: "Olive",        dot: "bg-lime-800" },
] as const;

// ── form state ─────────────────────────────────────────────────────────────

type FormState = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredientsText: string; // one per line
  priceStr: string;        // dollar string e.g. "15.00"
  color: string;
  image_key: string;
  square_url: string;
  square_variation_id: string;
  sort_order: string;
  active: boolean;
  sold_out: boolean;
};

const BLANK: FormState = {
  id: "",
  name: "",
  tagline: "",
  description: "",
  ingredientsText: "",
  priceStr: "",
  color: "clover",
  image_key: "",
  square_url: "",
  square_variation_id: "",
  sort_order: "0",
  active: true,
  sold_out: false,
};

function productToForm(p: AdminProduct): FormState {
  const ingredients: string[] = JSON.parse(p.ingredients);
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    ingredientsText: ingredients.join("\n"),
    priceStr: (p.price_cents / 100).toFixed(2),
    color: p.color,
    image_key: p.image_key,
    square_url: p.square_url,
    square_variation_id: p.square_variation_id ?? "",
    sort_order: String(p.sort_order),
    active: Boolean(p.active),
    sold_out: Boolean(p.sold_out),
  };
}

// ── page ───────────────────────────────────────────────────────────────────

function AdminProducts() {
  const products = Route.useLoaderData();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setIsNew(true);
    setForm(BLANK);
    setSheetOpen(true);
  }

  function openEdit(p: AdminProduct) {
    setIsNew(false);
    setForm(productToForm(p));
    setSheetOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const ingredients = form.ingredientsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await adminSaveProduct({
        data: {
          isNew,
          id: form.id.trim(),
          name: form.name,
          tagline: form.tagline,
          description: form.description,
          ingredients,
          price_cents: Math.round(parseFloat(form.priceStr) * 100),
          color: form.color,
          image_key: form.image_key || form.id.trim(),
          square_url: form.square_url,
          square_variation_id: form.square_variation_id || undefined,
          sort_order: parseInt(form.sort_order, 10) || 0,
          active: form.active,
          sold_out: form.sold_out,
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
    setDeleteError(null);
    try {
      await adminDeleteProduct({ data: { id: deleteTarget.id } });
      setDeleteTarget(null);
      await router.invalidate();
    } catch {
      setDeleteError("Could not delete — this product may be referenced by a modifier group.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage tea listings, pricing, and availability</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Color</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sort</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No products yet — add one above.
                </td>
              </tr>
            ) : (
              products.map((p: AdminProduct) => {
                const colorMeta = COLORS.find((c) => c.value === p.color);
                return (
                  <tr key={p.id} className={!p.active ? "opacity-45" : ""}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ${(p.price_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorMeta?.dot ?? "bg-gray-300"}`} />
                        <span className="text-gray-600">{colorMeta?.label ?? p.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.sort_order}</td>
                    <td className="px-4 py-3 space-x-1">
                      {!p.active && (
                        <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">Inactive</span>
                      )}
                      {Boolean(p.sold_out) && (
                        <span className="text-xs bg-red-50 text-red-600 rounded px-1.5 py-0.5">Sold Out</span>
                      )}
                      {p.active && !p.sold_out && (
                        <span className="text-xs bg-green-50 text-green-700 rounded px-1.5 py-0.5">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(p); setDeleteError(null); }}
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
        <SheetContent className="w-[500px] sm:max-w-[500px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{isNew ? "Add Product" : "Edit Product"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-6 space-y-4 pr-1">

            {/* ID — only editable on create */}
            <div>
              <Label htmlFor="id">
                Product ID *
                {isNew && <span className="ml-1 text-xs text-gray-400 font-normal">(kebab-case slug, e.g. "summer-blend")</span>}
              </Label>
              {isNew ? (
                <Input
                  id="id"
                  value={form.id}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    set("id", slug);
                    if (!form.image_key || form.image_key === form.id) set("image_key", slug);
                  }}
                  required
                  placeholder="my-new-tea"
                  className="mt-1 font-mono"
                />
              ) : (
                <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-500">
                  {form.id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} required className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} required rows={3} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="ingredients">
                Ingredients *
                <span className="ml-1 text-xs text-gray-400 font-normal">(one per line)</span>
              </Label>
              <Textarea
                id="ingredients"
                value={form.ingredientsText}
                onChange={(e) => set("ingredientsText", e.target.value)}
                required
                rows={4}
                placeholder={"Chamomile\nLemon balm\nOat straw"}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.priceStr}
                  onChange={(e) => set("priceStr", e.target.value)}
                  required
                  placeholder="15.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <Select value={form.color} onValueChange={(v) => set("color", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="image_key">
                  Image Key *
                  <span className="ml-1 text-xs text-gray-400 font-normal">(usually same as ID)</span>
                </Label>
                <Input id="image_key" value={form.image_key} onChange={(e) => set("image_key", e.target.value)} required className="mt-1 font-mono text-xs" />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input id="sort_order" type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="square_url">Square URL *</Label>
              <Input id="square_url" value={form.square_url} onChange={(e) => set("square_url", e.target.value)} required placeholder="https://drinkkidclover.square.site/product/..." className="mt-1 text-xs" />
            </div>

            <div>
              <Label htmlFor="square_variation_id">Square Variation ID</Label>
              <Input id="square_variation_id" value={form.square_variation_id} onChange={(e) => set("square_variation_id", e.target.value)} className="mt-1 font-mono text-xs" placeholder="Optional — required for cart checkout" />
            </div>

            <div className="flex gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox id="active" checked={form.active} onCheckedChange={(v) => set("active", Boolean(v))} />
                <Label htmlFor="active" className="font-normal cursor-pointer">Active (visible on site)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="sold_out" checked={form.sold_out} onCheckedChange={(v) => set("sold_out", Boolean(v))} />
                <Label htmlFor="sold_out" className="font-normal cursor-pointer">Sold out</Label>
              </div>
            </div>

            <SheetFooter className="pt-4 pb-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Product"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
              {deleteError && <span className="block mt-2 text-red-600">{deleteError}</span>}
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
