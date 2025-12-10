// src/app/(admin)/admin/countries/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Country = {
  id: number;
  code: string;
  name: string;
  flagEmoji: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [sortOrder, setSortOrder] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/countries");
      if (res.ok) {
        const json = await res.json();
        setCountries(json.countries ?? []);
      } else {
        const text = await res.text();
        console.error("Failed to load countries", text);
        setError("Failed to load countries");
      }
    } catch (e) {
      console.error(e);
      setError("Network error while loading countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          flagEmoji: flagEmoji || null,
          sortOrder:
            sortOrder === "" ? countries.length + 1 : Number(sortOrder),
          isActive,
        }),
      });

      if (res.ok) {
        setCode("");
        setName("");
        setFlagEmoji("");
        setSortOrder("");
        setIsActive(true);
        await loadCountries();
      } else {
        console.error("Create country failed", await res.text());
        setError("Failed to create country");
      }
    } catch (e) {
      console.error(e);
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-2 md:px-4 py-4 md:py-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Countries</h1>
        <p className="text-sm text-slate-400">
          Manage which countries are available inside Gold Live.
        </p>
      </div>

      {/* error badge */}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Add country form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 md:p-5 space-y-4"
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-slate-400 mb-1">
              Code (ISO)
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="PK"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-slate-400 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Pakistan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="w-28">
            <label className="block text-xs text-slate-400 mb-1">
              Flag emoji
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="🇵🇰"
              value={flagEmoji}
              onChange={(e) => setFlagEmoji(e.target.value)}
            />
          </div>

          <div className="w-24">
            <label className="block text-xs text-slate-400 mb-1">
              Order
            </label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
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
          {saving ? "Saving..." : "Add country"}
        </button>
      </form>

      {/* Countries table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span>
            {loading ? "Loading countries..." : `Total: ${countries.length}`}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <Th>Flag</Th>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Order</Th>
              <Th>Active</Th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <Td>
                  <span className="text-lg">{c.flagEmoji}</span>
                </Td>
                <Td className="text-slate-100 font-medium">{c.code}</Td>
                <Td className="text-slate-100">{c.name}</Td>
                <Td className="text-slate-300">{c.sortOrder}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                      c.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </Td>
              </tr>
            ))}

            {!loading && countries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
                  No countries yet. Use the form above to add one.
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
