"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type StoreItem = {
  id: string;
  categoryId: string;
  title: string;
  description?: string | null;
  priceCoins: number;

  section?: string | null;
  sectionSortOrder: number;

  mediaType: "IMAGE" | "GIF" | "VIDEO";
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;

  type:
    | "HONOR"
    | "PREMIUM_ID"
    | "RIDE"
    | "PROFILE_CARD"
    | "AVATAR_FRAME"
    | "PARTY_THEME"
    | "CHAT_BUBBLE"
    | "OTHER";

  durationDays?: number | null;

  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* =========================================================
   Upload helpers
   ========================================================= */

function inferMediaTypeFromFile(file: File): "IMAGE" | "GIF" | "VIDEO" {
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("video/")) return "VIDEO";
  if (t === "image/gif") return "GIF";
  return "IMAGE";
}

function prettyBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n = n / 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function isAbsoluteUrl(v: string) {
  return /^https?:\/\//i.test(v);
}

/**
 * We want to store a "DB friendly" value:
 * - If it’s same-origin full url => store only the pathname (/uploads/..)
 * - If it’s already relative (/uploads/..) => keep it
 * - If it’s external CDN url => keep the full url
 */
function normalizeForDb(v: string) {
  const raw = (v || "").trim();
  if (!raw) return raw;

  // already relative
  if (raw.startsWith("/")) return raw;

  // absolute - try to strip origin
  if (isAbsoluteUrl(raw)) {
    try {
      const u = new URL(raw);
      // store only path+search (usually you only need pathname)
      return u.pathname + (u.search || "");
    } catch {
      return raw;
    }
  }

  // fallback (rare)
  return raw;
}

/**
 * For preview in the admin UI:
 * - relative path => use as-is (browser will resolve on same origin)
 * - absolute url => use as-is
 */
function toPreviewSrc(v?: string | null) {
  const raw = (v || "").trim();
  if (!raw) return "";
  return raw.startsWith("/") || isAbsoluteUrl(raw) ? raw : `/${raw}`;
}

async function uploadStoreFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  // ✅ use the singular endpoint
  const res = await fetch("/api/admin/store/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => null);

  if (!res.ok) throw new Error(json?.error || "Upload failed");

  // supports { path } or { url }
  const candidate = String(json?.path || json?.url || "");
  if (!candidate) throw new Error("Upload succeeded but no path/url returned");

  return normalizeForDb(candidate);
}

/* =========================================================
   Page
   ========================================================= */

export default function AdminStorePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((x) => x.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const [draft, setDraft] = useState<StoreItem | null>(null);

  // create category
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");

  // create item
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(0);

  // uploads
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    const totalCats = categories.length;
    const activeCats = categories.filter((c) => c.isActive).length;
    const totalItems = items.length;
    const activeItems = items.filter((i) => i.isActive).length;
    const featured = items.filter((i) => i.isFeatured).length;
    return { totalCats, activeCats, totalItems, activeItems, featured };
  }, [categories, items]);

  async function loadCategories() {
    const res = await fetch("/api/admin/store/categories", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to load categories");

    const list: Category[] = Array.isArray(json?.categories) ? json.categories : [];
    setCategories(list);

    // pick first category if none selected
    if (!selectedCategoryId && list[0]?.id) setSelectedCategoryId(list[0].id);
  }

  async function loadItems(catId?: string | null) {
    const id = catId ?? selectedCategoryId;
    if (!id) {
      setItems([]);
      setSelectedItemId(null);
      return;
    }

    const res = await fetch(`/api/admin/store/items?categoryId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to load items");

    const list: StoreItem[] = Array.isArray(json?.items) ? json.items : [];
    setItems(list);

    // if current selected item no longer exists, select first
    if (list.length === 0) {
      setSelectedItemId(null);
      return;
    }

    if (!selectedItemId) {
      setSelectedItemId(list[0].id);
      return;
    }

    const stillExists = list.some((x) => x.id === selectedItemId);
    if (!stillExists) setSelectedItemId(list[0].id);
  }

  async function loadAll() {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      await loadCategories();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        await loadItems(selectedCategoryId);
      } catch (e: any) {
        setErr(e?.message || "Error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  // ✅ keep draft synced with current selected item
  useEffect(() => {
    if (!selectedItem) {
      setDraft(null);
      return;
    }
    setDraft(JSON.parse(JSON.stringify(selectedItem)));
  }, [selectedItem?.id]); // stable

  const dirty = useMemo(() => {
    if (!draft || !selectedItem) return false;
    return JSON.stringify(draft) !== JSON.stringify(selectedItem);
  }, [draft, selectedItem]);

  const busyUploads = uploadingMedia || uploadingThumb;

  /* =========================================================
     CRUD
     ========================================================= */

  async function createCategory() {
    setErr(null);
    setNotice(null);
    const name = newCatName.trim();
    if (!name) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/store/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: newCatSlug.trim() || name,
          icon: newCatIcon.trim() || null,
          isActive: true,
          sortOrder: 0,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create category failed");

      setNotice("Category created ✅");
      setNewCatName("");
      setNewCatSlug("");
      setNewCatIcon("");
      await loadCategories();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function createItem() {
    setErr(null);
    setNotice(null);
    const title = newItemTitle.trim();
    if (!title) return;
    if (!selectedCategoryId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/store/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          title,
          priceCoins: Number(newItemPrice) || 0,
          isActive: true,
          isFeatured: false,
          sortOrder: 0,
          section: "New This Month",
          sectionSortOrder: 0,
          mediaType: "IMAGE",
          mediaUrl: null,
          thumbnailUrl: null,
          type: "OTHER",
          durationDays: null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create item failed");

      setNotice("Item created ✅");
      setNewItemTitle("");
      setNewItemPrice(0);
      await loadItems(selectedCategoryId);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function saveItem() {
    if (!draft?.id) {
      setErr("Missing item id. Re-select the item and try again.");
      return;
    }

    setSaving(true);
    setErr(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/store/items/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Save failed");

      setNotice("Item saved ✅");
      await loadItems(selectedCategoryId);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setSaving(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/store/items/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      setNotice("Item deleted ✅");
      setSelectedItemId(null);
      await loadItems(selectedCategoryId);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     Upload actions
     ========================================================= */

  async function onPickMediaFile(file: File) {
    if (!draft) return;
    setErr(null);
    setNotice(null);

    try {
      setUploadingMedia(true);

      const pathOrUrl = await uploadStoreFile(file);
      const mt = inferMediaTypeFromFile(file);

      setDraft((prev) => {
        if (!prev) return prev;
        const next: StoreItem = { ...prev, mediaUrl: pathOrUrl, mediaType: mt };

        // nice UX: if image/gif and no thumbnail, reuse media as thumbnail
        if ((mt === "IMAGE" || mt === "GIF") && !next.thumbnailUrl) {
          next.thumbnailUrl = pathOrUrl;
        }

        // if video and thumbnail equals media (from previous), clear it
        if (mt === "VIDEO" && next.thumbnailUrl && next.thumbnailUrl === next.mediaUrl) {
          next.thumbnailUrl = null;
        }

        return next;
      });

      setNotice(
        `Media uploaded ✅ (${file.name}${file.size ? ` • ${prettyBytes(file.size)}` : ""})`
      );
    } catch (e: any) {
      setErr(e?.message || "Upload error");
    } finally {
      setUploadingMedia(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  }

  async function onPickThumbFile(file: File) {
    if (!draft) return;
    setErr(null);
    setNotice(null);

    try {
      setUploadingThumb(true);
      const pathOrUrl = await uploadStoreFile(file);

      setDraft((prev) => (prev ? { ...prev, thumbnailUrl: pathOrUrl } : prev));
      setNotice(
        `Thumbnail uploaded ✅ (${file.name}${file.size ? ` • ${prettyBytes(file.size)}` : ""})`
      );
    } catch (e: any) {
      setErr(e?.message || "Upload error");
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  }

  const showVideoThumbWarning =
    !!draft && draft.mediaType === "VIDEO" && (!draft.thumbnailUrl || !draft.thumbnailUrl.trim());

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0">
        {/* Top bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-50">
              Store Management
            </h1>
            <p className="text-[12px] text-slate-400 mt-1">
              Upload categories + items for the mobile Store screen. Supports file upload (image/gif/video).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill label={`Cats: ${stats.totalCats} (${stats.activeCats} active)`} />
            <Pill label={`Items: ${stats.totalItems} (${stats.activeItems} active)`} />
            <Pill label={`Featured: ${stats.featured}`} />

            <button
              onClick={loadAll}
              disabled={loading}
              className={cx(
                "rounded-xl px-3.5 py-2 text-[13px] font-medium border transition",
                "border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
            {err}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">
            {notice}
          </div>
        )}

        {/* Create category */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[14px] font-semibold text-slate-100">Create category</h2>
            <span className="text-[11px] text-slate-400">Example slug: avatar-frame</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <Field label="Name" className="lg:col-span-4">
              <input
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </Field>

            <Field label="Slug (optional)" className="lg:col-span-4">
              <input
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
              />
            </Field>

            <Field label="Icon (Ionicons name)" className="lg:col-span-3">
              <input
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                placeholder="flame-outline"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
              />
            </Field>

            <div className="lg:col-span-1 flex lg:justify-end">
              <button
                onClick={createCategory}
                disabled={!newCatName.trim() || saving}
                className={cx(
                  "h-10 rounded-xl px-4 text-[13px] font-semibold transition",
                  "bg-yellow-400 text-black hover:bg-yellow-300",
                  (!newCatName.trim() || saving) && "opacity-60 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Categories + Create Item */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-slate-100">Categories</h2>
                <span className="text-[11px] text-slate-400">Select</span>
              </div>

              <div className="mt-3 space-y-2">
                {categories.map((c) => {
                  const active = c.id === selectedCategoryId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategoryId(c.id);
                        setSelectedItemId(null);
                      }}
                      className={cx(
                        "w-full text-left rounded-2xl border px-3.5 py-3 transition",
                        active
                          ? "border-yellow-400/40 bg-slate-950/40"
                          : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/35"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[13px] font-semibold text-slate-100 truncate">
                          {c.name}{" "}
                          <span className="text-slate-400 font-normal">({c.slug})</span>
                        </div>
                        <span
                          className={cx(
                            "text-[11px] rounded-full px-2 py-0.5 border whitespace-nowrap",
                            c.isActive
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-900/40 text-slate-400"
                          )}
                        >
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-400 break-words">
                        Icon: {c.icon ?? "-"}
                      </div>
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <div className="text-[13px] text-slate-400">No categories.</div>
                )}
              </div>
            </div>

            {/* Create item */}
            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl shadow-black/20">
              <h3 className="text-[14px] font-semibold text-slate-100">Create item</h3>
              <div className="mt-3 grid gap-3">
                <Field label="Title">
                  <input
                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                </Field>

                <Field label="Price (Coins)">
                  <input
                    type="number"
                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value) || 0)}
                  />
                </Field>

                <button
                  onClick={createItem}
                  disabled={!selectedCategoryId || !newItemTitle.trim() || saving}
                  className={cx(
                    "h-10 rounded-xl px-4 text-[13px] font-semibold transition",
                    "bg-yellow-400 text-black hover:bg-yellow-300",
                    (!selectedCategoryId || !newItemTitle.trim() || saving) &&
                      "opacity-60 cursor-not-allowed"
                  )}
                >
                  Create item
                </button>
              </div>
            </div>
          </div>

          {/* Items + Editor */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-slate-100">Items</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select an item to edit. Popular tab can be powered by “Featured”.
                  </p>
                </div>

                <button
                  onClick={saveItem}
                  disabled={!dirty || saving || !draft || busyUploads}
                  className={cx(
                    "h-10 rounded-xl px-4 text-[13px] font-semibold transition border",
                    dirty
                      ? "border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300"
                      : "border-slate-700 bg-slate-900/60 text-slate-400 cursor-not-allowed",
                    (saving || busyUploads) && "opacity-60 cursor-not-allowed"
                  )}
                  title={busyUploads ? "Wait for upload to finish" : undefined}
                >
                  {busyUploads
                    ? "Uploading..."
                    : saving
                    ? "Saving..."
                    : dirty
                    ? "Save changes"
                    : "Saved"}
                </button>
              </div>

              {/* Item list */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {items.map((it) => {
                  const active = it.id === selectedItemId;
                  const hasMedia = !!it.mediaUrl || !!it.thumbnailUrl;

                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedItemId(it.id)}
                      className={cx(
                        "text-left rounded-2xl border px-3.5 py-3 transition",
                        active
                          ? "border-yellow-400/40 bg-slate-950/40"
                          : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/35"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-semibold text-slate-100 truncate">
                          {it.title}
                          {hasMedia ? (
                            <span className="ml-2 text-[11px] text-slate-400">• media</span>
                          ) : null}
                        </div>
                        <div className="text-[12px] text-yellow-300 whitespace-nowrap">
                          {it.priceCoins.toLocaleString()} coins
                        </div>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-400">
                        Section: {it.section || "Items"} • {it.isFeatured ? "Featured" : "—"} •{" "}
                        {it.mediaType}
                      </div>
                    </button>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-[13px] text-slate-400">No items in this category.</div>
                )}
              </div>

              {/* Editor */}
              {!draft ? (
                <div className="mt-4 text-[13px] text-slate-400">Select an item…</div>
              ) : (
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[14px] font-semibold text-slate-100">Edit item</div>
                    <button
                      onClick={() => deleteItem(draft.id)}
                      className="h-9 rounded-xl border border-slate-700 bg-slate-900/60 px-3 text-[12px] font-medium text-red-200 hover:bg-slate-900"
                      disabled={saving || busyUploads}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Media Preview + Upload */}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[12px] font-semibold text-slate-200">Media</div>
                        <div className="flex items-center gap-2">
                          <input
                            ref={mediaInputRef}
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onPickMediaFile(f);
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => mediaInputRef.current?.click()}
                            disabled={uploadingMedia || saving}
                            className={cx(
                              "h-9 rounded-xl px-3 text-[12px] font-semibold border transition",
                              "border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900",
                              (uploadingMedia || saving) && "opacity-60 cursor-not-allowed"
                            )}
                          >
                            {uploadingMedia ? "Uploading..." : "Upload file"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, mediaUrl: null })}
                            disabled={!draft.mediaUrl || uploadingMedia || saving}
                            className={cx(
                              "h-9 rounded-xl px-3 text-[12px] font-semibold border transition",
                              "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-950/60",
                              (!draft.mediaUrl || uploadingMedia || saving) &&
                                "opacity-60 cursor-not-allowed"
                            )}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-3">
                        <MediaPreview
                          mediaType={draft.mediaType}
                          mediaUrl={toPreviewSrc(draft.mediaUrl)}
                        />

                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          <Field label="Media Type">
                            <select
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                              value={draft.mediaType}
                              onChange={(e) =>
                                setDraft({ ...draft, mediaType: e.target.value as any })
                              }
                            >
                              <option value="IMAGE">IMAGE</option>
                              <option value="GIF">GIF</option>
                              <option value="VIDEO">VIDEO</option>
                            </select>
                          </Field>

                          <Field label="Media URL (optional)">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                              value={draft.mediaUrl ?? ""}
                              onChange={(e) =>
                                setDraft({ ...draft, mediaUrl: e.target.value || null })
                              }
                            />
                          </Field>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-500">
                          Stored in DB:{" "}
                          <code className="text-slate-300">
                            {draft.mediaUrl || "(empty)"}
                          </code>
                        </div>
                      </div>

                      {showVideoThumbWarning ? (
                        <div className="mt-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[12px] text-yellow-200">
                          Video items should have a thumbnail for better loading on mobile.
                        </div>
                      ) : null}
                    </div>

                    {/* Thumbnail Preview + Upload */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <div className="text-[12px] font-semibold text-slate-200">Thumbnail</div>
                        <div className="flex items-center gap-2">
                          <input
                            ref={thumbInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onPickThumbFile(f);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            disabled={uploadingThumb || saving}
                            className={cx(
                              "h-9 rounded-xl px-3 text-[12px] font-semibold border transition",
                              "border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900",
                              (uploadingThumb || saving) && "opacity-60 cursor-not-allowed"
                            )}
                          >
                            {uploadingThumb ? "Uploading..." : "Upload thumbnail"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, thumbnailUrl: null })}
                            disabled={!draft.thumbnailUrl || uploadingThumb || saving}
                            className={cx(
                              "h-9 rounded-xl px-3 text-[12px] font-semibold border transition",
                              "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-950/60",
                              (!draft.thumbnailUrl || uploadingThumb || saving) &&
                                "opacity-60 cursor-not-allowed"
                            )}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-3">
                        <ThumbPreview thumbnailUrl={toPreviewSrc(draft.thumbnailUrl)} />
                        <div className="mt-2">
                          <Field label="Thumbnail URL (optional)">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                              value={draft.thumbnailUrl ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  thumbnailUrl: e.target.value || null,
                                })
                              }
                            />
                          </Field>

                          <div className="mt-2 text-[11px] text-slate-500">
                            Stored in DB:{" "}
                            <code className="text-slate-300">
                              {draft.thumbnailUrl || "(empty)"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other fields */}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Field label="Title">
                      <input
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      />
                    </Field>

                    <Field label="Price (Coins)">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.priceCoins}
                        onChange={(e) =>
                          setDraft({ ...draft, priceCoins: Number(e.target.value) || 0 })
                        }
                      />
                    </Field>

                    <Field label="Section (UI group)">
                      <input
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.section ?? ""}
                        onChange={(e) => setDraft({ ...draft, section: e.target.value })}
                      />
                    </Field>

                    <Field label="Section Sort Order">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.sectionSortOrder ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            sectionSortOrder: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>

                    <Field label="Type">
                      <select
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.type}
                        onChange={(e) => setDraft({ ...draft, type: e.target.value as any })}
                      >
                        {[
                          "HONOR",
                          "PREMIUM_ID",
                          "RIDE",
                          "PROFILE_CARD",
                          "AVATAR_FRAME",
                          "PARTY_THEME",
                          "CHAT_BUBBLE",
                          "OTHER",
                        ].map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Duration Days (null = permanent)">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.durationDays ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          setDraft({
                            ...draft,
                            durationDays: v === "" ? null : Number(v) || 0,
                          });
                        }}
                      />
                    </Field>

                    <Field label="Description" className="md:col-span-2">
                      <input
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.description ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, description: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Sort Order">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none"
                        value={draft.sortOrder}
                        onChange={(e) =>
                          setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })
                        }
                      />
                    </Field>

                    <div className="flex items-end gap-2">
                      <Toggle
                        label="Active"
                        value={draft.isActive}
                        onChange={(v) => setDraft({ ...draft, isActive: v })}
                      />
                      <Toggle
                        label="Featured (Popular)"
                        value={draft.isFeatured}
                        onChange={(v) => setDraft({ ...draft, isFeatured: v })}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500">
                    Upload endpoint:{" "}
                    <code className="text-slate-300">POST /api/admin/store/upload</code>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              Mobile endpoint:{" "}
              <code className="text-slate-300">/api/profile/store?userId=...&category=popular</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   UI helpers
   ========================================================= */

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="text-[11px] font-medium text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[12px] text-slate-200 whitespace-nowrap">
      {label}
    </span>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cx(
        "h-10 flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 text-[13px] transition",
        value
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-950/60"
      )}
      aria-pressed={value}
    >
      <span className={cx("h-2.5 w-2.5 rounded-full", value ? "bg-emerald-400" : "bg-slate-500")} />
      {label}
    </button>
  );
}

/* =========================================================
   Preview components
   ========================================================= */

function MediaPreview({
  mediaType,
  mediaUrl,
}: {
  mediaType: "IMAGE" | "GIF" | "VIDEO";
  mediaUrl?: string | null;
}) {
  if (!mediaUrl) {
    return (
      <div className="h-44 w-full rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center">
        <div className="text-[12px] text-slate-500">No media uploaded yet</div>
      </div>
    );
  }

  if (mediaType === "VIDEO") {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
        <video src={mediaUrl} controls className="w-full h-44 object-contain" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mediaUrl} alt="media" className="w-full h-44 object-cover" />
    </div>
  );
}

function ThumbPreview({ thumbnailUrl }: { thumbnailUrl?: string | null }) {
  if (!thumbnailUrl) {
    return (
      <div className="h-36 w-full rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center">
        <div className="text-[12px] text-slate-500">No thumbnail</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailUrl} alt="thumbnail" className="w-full h-36 object-cover" />
    </div>
  );
}
