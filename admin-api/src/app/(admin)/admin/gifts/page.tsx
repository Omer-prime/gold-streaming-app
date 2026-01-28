// src/app/(admin)/admin/gifts/page.tsx
"use client";

import React, { useEffect, useMemo, useState, FormEvent } from "react";

type GiftMediaType = "IMAGE" | "GIF" | "VIDEO";

type Gift = {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;

  // old
  iconUrl: string | null;

  // new
  mediaType: GiftMediaType;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
};

type ListResp = {
  gifts: Gift[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

function isVideoUrl(u?: string | null) {
  const s = (u || "").toLowerCase();
  return s.endsWith(".mp4") || s.endsWith(".mov") || s.endsWith(".webm");
}

function isGifUrl(u?: string | null) {
  const s = (u || "").toLowerCase();
  return s.endsWith(".gif");
}

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  // URL option (still available)
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [mediaType, setMediaType] = useState<GiftMediaType>("IMAGE");

  const canPrev = page > 1;
  const canNext = page < pages;

  const loadGifts = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gifts?page=${p}&limit=${limit}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load gifts");
        return;
      }
      const json = (await res.json().catch(() => null)) as ListResp | null;
      if (!json) {
        setError("Failed to load gifts");
        return;
      }
      setGifts(json.gifts ?? []);
      setPage(json.page ?? p);
      setTotal(json.total ?? 0);
      setPages(json.pages ?? 1);
    } catch (err) {
      console.error(err);
      setError("Network error while loading gifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageLabel = useMemo(() => {
    if (loading) return "Loading gifts...";
    return `Total: ${total}`;
  }, [loading, total]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/uploads/gift", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) {
        setError(json?.error || "Upload failed");
        return;
      }

      const url: string = json.url;
      setMediaUrl(url);

      // auto type guess
      if (isGifUrl(url)) setMediaType("GIF");
      else if (isVideoUrl(url)) setMediaType("VIDEO");
      else setMediaType("IMAGE");
    } catch (e) {
      console.error(e);
      setError("Upload failed (network)");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (price === "" || Number.isNaN(Number(price))) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          isActive,

          // keep old iconUrl if you still want small icon support
          iconUrl: null,

          // new media fields
          mediaType,
          mediaUrl: mediaUrl.trim() || null,
          thumbnailUrl: thumbnailUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        setError("Failed to create gift");
        return;
      }

      setName("");
      setPrice("");
      setIsActive(true);
      setMediaUrl("");
      setThumbnailUrl("");
      setMediaType("IMAGE");

      await loadGifts(1);
    } catch (err) {
      console.error(err);
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-2 md:px-4 py-4 md:py-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Gifts</h1>
        <p className="text-sm text-slate-400">
          Configure virtual gifts (supports image / gif / video) and coin prices used inside Gold Live.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Add gift form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 md:p-5 space-y-4"
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Golden Rose"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="w-28">
            <label className="block text-xs text-slate-400 mb-1">Price (coins)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100"
              min={0}
            />
          </div>

          <label className="mt-6 inline-flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>

        {/* media type + upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as GiftMediaType)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="IMAGE">Image</option>
              <option value="GIF">GIF</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Upload (image / gif / video)</label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="image/*,video/*,.gif"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
              />
              <div className="text-xs text-slate-400 w-28 text-right">
                {uploading ? "Uploading..." : ""}
              </div>
            </div>
          </div>
        </div>

        {/* url fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Media URL (auto-filled after upload)</label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="/uploads/gifts/....gif or https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Thumbnail URL (optional for video)</label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="/uploads/gifts/thumb.png"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>
        </div>

        {/* preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="text-xs text-slate-400 mb-2">Preview</div>
          {mediaUrl ? (
            mediaType === "VIDEO" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={mediaUrl}
                controls
                className="max-h-44 rounded-lg border border-slate-800"
                style={{ width: "100%", objectFit: "cover" }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="preview"
                className="max-h-44 rounded-lg border border-slate-800 object-cover"
                style={{ width: "100%" }}
              />
            )
          ) : (
            <div className="text-xs text-slate-500">No media selected yet.</div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add gift"}
        </button>
      </form>

      {/* Gifts table + pagination */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span>{pageLabel}</span>

          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-50"
              disabled={!canPrev || loading}
              onClick={() => {
                const p = Math.max(1, page - 1);
                loadGifts(p);
              }}
              type="button"
            >
              Prev
            </button>
            <span className="text-xs text-slate-400">
              Page {page} / {pages}
            </span>
            <button
              className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-50"
              disabled={!canNext || loading}
              onClick={() => {
                const p = Math.min(pages, page + 1);
                loadGifts(p);
              }}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <Th>Preview</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((g) => (
              <tr key={g.id} className="border-t border-slate-800">
                <Td>
                  {g.mediaUrl ? (
                    g.mediaType === "VIDEO" ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={g.mediaUrl}
                        className="h-10 w-14 rounded-md object-cover bg-slate-800 border border-slate-700"
                        muted
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.mediaUrl}
                        alt={g.name}
                        className="h-10 w-10 rounded-md object-cover bg-slate-800 border border-slate-700"
                      />
                    )
                  ) : g.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.iconUrl}
                      alt={g.name}
                      className="h-10 w-10 rounded-md object-cover bg-slate-800 border border-slate-700"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                      N/A
                    </div>
                  )}
                </Td>
                <Td className="text-slate-100 font-medium">{g.name}</Td>
                <Td className="text-slate-200">{g.mediaType}</Td>
                <Td className="text-slate-100">{g.price}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                      g.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {g.isActive ? "Active" : "Disabled"}
                  </span>
                </Td>
                <Td className="text-slate-400 text-xs">
                  {g.createdAt ? new Date(g.createdAt).toISOString().slice(0, 10) : "-"}
                </Td>
              </tr>
            ))}

            {!loading && gifts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                  No gifts yet. Use the form above to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left text-xs text-slate-400">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={"px-4 py-2 text-xs text-slate-100 whitespace-nowrap " + (className ?? "")}>{children}</td>;
}
