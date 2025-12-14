// admin-api/src/app/admin/topics/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type TopicCategory = "DAILY" | "OFFICIAL" | "NORMAL";

type TopicRow = {
  id: string;
  title: string;
  description: string | null;
  category: TopicCategory;
  isTrending: boolean;
  isActive: boolean;
  sortOrder: number;
  hotCount: number;
};

export default function AdminTopicsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [topics, setTopics] = useState<TopicRow[]>([]);

  // create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TopicCategory>("NORMAL");
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [hotCount, setHotCount] = useState(0);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/topics?category=ALL&includeInactive=1`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to load topics");
      }

      const j = (await res.json()) as { topics: any[] };
      const mapped: TopicRow[] = (j.topics || []).map((t) => ({
        id: String(t.id),
        title: String(t.title ?? ""),
        description: t.description ?? null,
        category: (t.category ?? "NORMAL") as TopicCategory,
        isTrending: !!t.isTrending,
        isActive: !!t.isActive,
        sortOrder: Number(t.sortOrder ?? 0) || 0,
        hotCount: Number(t.hotCount ?? 0) || 0,
      }));

      setTopics(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load topics");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => {
      if (a.isTrending !== b.isTrending) return a.isTrending ? -1 : 1;
      if (a.hotCount !== b.hotCount) return b.hotCount - a.hotCount;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title);
    });
  }, [topics]);

  const saveTopic = async (payload: Partial<TopicRow> & { id?: string }) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          isTrending: payload.isTrending,
          isActive: payload.isActive,
          sortOrder: payload.sortOrder,
          hotScore: payload.hotCount,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to save topic");
      }

      await fetchTopics();
    } finally {
      setSaving(false);
    }
  };

  const createTopic = async () => {
    if (!title.trim()) return;

    await saveTopic({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      category,
      isTrending,
      isActive,
      sortOrder,
      hotCount,
    });

    setTitle("");
    setDescription("");
    setCategory("NORMAL");
    setIsTrending(false);
    setIsActive(true);
    setSortOrder(0);
    setHotCount(0);
  };

  return (
  
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Square Topics</h1>
          <button
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={fetchTopics}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create */}
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Create Topic</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Topic title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
            >
              <option value="DAILY">Daily</option>
              <option value="OFFICIAL">Official</option>
              <option value="NORMAL">Normal</option>
            </select>

            <input
              className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
                Trending
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <input
                className="w-32 rounded-lg border px-3 py-2 text-sm"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                placeholder="Sort"
              />
              <input
                className="w-32 rounded-lg border px-3 py-2 text-sm"
                type="number"
                value={hotCount}
                onChange={(e) => setHotCount(Number(e.target.value) || 0)}
                placeholder="Hot"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              onClick={createTopic}
              disabled={saving || !title.trim()}
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">All Topics</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th>Category</th>
                  <th>Trending</th>
                  <th>Active</th>
                  <th>Sort</th>
                  <th>Hot</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedTopics.map((t) => (
                  <TopicRowItem
                    key={t.id}
                    topic={t}
                    saving={saving}
                    onSave={(next) => saveTopic({ id: t.id, ...next })}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {sortedTopics.length === 0 && !loading && (
            <div className="text-sm text-zinc-500">No topics yet.</div>
          )}
        </div>
      </div>
  
  );
}

function TopicRowItem({
  topic,
  saving,
  onSave,
}: {
  topic: TopicRow;
  saving: boolean;
  onSave: (next: Partial<TopicRow>) => void;
}) {
  const [local, setLocal] = useState(topic);

  useEffect(() => {
    setLocal(topic);
  }, [topic]);

  return (
    <tr className="border-b">
      <td className="py-2">
        <input
          className="w-full rounded-lg border px-2 py-1"
          value={local.title}
          onChange={(e) => setLocal((p) => ({ ...p, title: e.target.value }))}
        />
      </td>

      <td>
        <select
          className="rounded-lg border px-2 py-1"
          value={local.category}
          onChange={(e) => setLocal((p) => ({ ...p, category: e.target.value as any }))}
        >
          <option value="DAILY">Daily</option>
          <option value="OFFICIAL">Official</option>
          <option value="NORMAL">Normal</option>
        </select>
      </td>

      <td>
        <input
          type="checkbox"
          checked={local.isTrending}
          onChange={(e) => setLocal((p) => ({ ...p, isTrending: e.target.checked }))}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={local.isActive}
          onChange={(e) => setLocal((p) => ({ ...p, isActive: e.target.checked }))}
        />
      </td>

      <td>
        <input
          className="w-20 rounded-lg border px-2 py-1"
          type="number"
          value={local.sortOrder}
          onChange={(e) => setLocal((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
        />
      </td>

      <td>
        <input
          className="w-20 rounded-lg border px-2 py-1"
          type="number"
          value={local.hotCount}
          onChange={(e) => setLocal((p) => ({ ...p, hotCount: Number(e.target.value) || 0 }))}
        />
      </td>

      <td className="py-2">
        <button
          className="rounded-lg border px-3 py-1 disabled:opacity-60"
          disabled={saving}
          onClick={() =>
            onSave({
              title: local.title,
              description: local.description,
              category: local.category,
              isTrending: local.isTrending,
              isActive: local.isActive,
              sortOrder: local.sortOrder,
              hotCount: local.hotCount,
            })
          }
        >
          Save
        </button>
      </td>
    </tr>
  );
}
