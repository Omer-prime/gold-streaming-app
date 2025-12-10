// src/app/(admin)/admin/gifts/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Gift = {
  id: number;
  name: string;
  iconUrl: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
};

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const loadGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gifts");
      if (res.ok) {
        const json = await res.json();
        setGifts(json.gifts ?? []);
      } else {
        console.error("Failed to load gifts", await res.text());
        setError("Failed to load gifts");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while loading gifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === "" || Number.isNaN(Number(price))) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          iconUrl: iconUrl.trim() || null,
          price: Number(price),
          isActive,
        }),
      });

      if (res.ok) {
        setName("");
        setIconUrl("");
        setPrice("");
        setIsActive(true);
        await loadGifts();
      } else {
        console.error("Create gift failed", await res.text());
        setError("Failed to create gift");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-2 md:px-4 py-4 md:py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Gifts</h1>
        <p className="text-sm text-slate-400">
          Configure virtual gifts and coin prices used inside Gold Live.
        </p>
      </div>

      {/* Error */}
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
            <label className="block text-xs text-slate-400 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Golden Rose"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-400 mb-1">
              Icon URL (optional)
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/gift.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
            />
          </div>

          <div className="w-28">
            <label className="block text-xs text-slate-400 mb-1">
              Price (coins)
            </label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="100"
              min={0}
            />
          </div>

          <label className="mt-6 inline-flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add gift"}
        </button>
      </form>

      {/* Gifts table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span>
            {loading ? "Loading gifts..." : `Total: ${gifts.length}`}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <Th>Icon</Th>
              <Th>Name</Th>
              <Th>Price (coins)</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((g) => (
              <tr key={g.id} className="border-t border-slate-800">
                <Td>
                  {g.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.iconUrl}
                      alt={g.name}
                      className="h-7 w-7 rounded-md object-cover bg-slate-800"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-md bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                      N/A
                    </div>
                  )}
                </Td>
                <Td className="text-slate-100 font-medium">{g.name}</Td>
                <Td className="text-slate-100">{g.price}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                      g.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {g.isActive ? "Active" : "Disabled"}
                  </span>
                </Td>
                <Td className="text-slate-400 text-xs">
                  {g.createdAt
                    ? new Date(g.createdAt).toISOString().slice(0, 10)
                    : "-"}
                </Td>
              </tr>
            ))}

            {!loading && gifts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
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
  return (
    <th className="px-4 py-2 text-left text-xs text-slate-400">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={
        "px-4 py-2 text-xs text-slate-100 whitespace-nowrap " +
        (className ?? "")
      }
    >
      {children}
    </td>
  );
}
