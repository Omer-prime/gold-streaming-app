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

const categoryLabel: Record<TopicCategory, string> = {
  DAILY: "Daily",
  OFFICIAL: "Official",
  NORMAL: "Normal",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminTopicsPage() {
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [topics, setTopics] = useState<TopicRow[]>([]);

  // create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TopicCategory>("NORMAL");
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [hotCount, setHotCount] = useState(0);

  // list controls
  const [q, setQ] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | TopicCategory>(
    "ALL"
  );
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [filterTrending, setFilterTrending] = useState<"ALL" | "TRENDING">("ALL");

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);

      // includeInactive=1 so admin can manage inactive topics too
      const res = await fetch(`/api/topics?category=ALL&includeInactive=1`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to load topics");
      }

      const j = (await res.json()) as { topics: TopicRow[] };

      const mapped: TopicRow[] = (j.topics || []).map((t: any) => ({
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

  // quick stats
  const stats = useMemo(() => {
    const total = topics.length;
    const active = topics.filter((t) => t.isActive).length;
    const trending = topics.filter((t) => t.isTrending).length;
    return { total, active, trending };
  }, [topics]);

  const filteredSortedTopics = useMemo(() => {
    let list = [...topics];

    // search
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((t) => {
        const d = (t.description ?? "").toLowerCase();
        return t.title.toLowerCase().includes(needle) || d.includes(needle);
      });
    }

    // filters
    if (filterCategory !== "ALL") {
      list = list.filter((t) => t.category === filterCategory);
    }

    if (filterStatus === "ACTIVE") list = list.filter((t) => t.isActive);
    if (filterStatus === "INACTIVE") list = list.filter((t) => !t.isActive);

    if (filterTrending === "TRENDING") list = list.filter((t) => t.isTrending);

    // sort: trending first, then hot desc, then sortOrder asc, then title
    list.sort((a, b) => {
      if (a.isTrending !== b.isTrending) return a.isTrending ? -1 : 1;
      if (a.hotCount !== b.hotCount) return b.hotCount - a.hotCount;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [topics, q, filterCategory, filterStatus, filterTrending]);

  const saveTopic = async (payload: Partial<TopicRow> & { id?: string }) => {
    try {
      setError(null);
      setNotice(null);

      if (payload.id) setSavingId(payload.id);

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

      setNotice(payload.id ? "Topic updated ✅" : "Topic created ✅");
      await fetchTopics();
    } catch (e: any) {
      setError(e?.message || "Failed to save topic");
    } finally {
      setSavingId(null);
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
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-50">
            Square Topics
          </h1>
          <p className="text-[12px] text-slate-400 mt-1">
            Control Hot Topics shown on the Square tab (admin-managed).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-[12px]">
            <Pill label={`Total: ${stats.total}`} />
            <Pill label={`Active: ${stats.active}`} />
            <Pill label={`Trending: ${stats.trending}`} />
          </div>

          <button
            onClick={fetchTopics}
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

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">
          {notice}
        </div>
      )}

      {/* Create card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-slate-100">
            Create topic
          </h2>
          <span className="text-[11px] text-slate-400">
            Used for Hot topics + filtering in app
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Title">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60"
              placeholder="e.g. Honor Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Category">
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
            >
              <option value="DAILY">Daily</option>
              <option value="OFFICIAL">Official</option>
              <option value="NORMAL">Normal</option>
            </select>
          </Field>

          <Field label="Description (optional)" className="md:col-span-2">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60"
              placeholder="Short description shown in admin only (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
            <Field label="Sort order">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
            </Field>

            <Field label="Hot score">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
                type="number"
                value={hotCount}
                onChange={(e) => setHotCount(Number(e.target.value) || 0)}
              />
            </Field>

            <div className="flex items-end gap-2">
              <Toggle
                label="Trending"
                value={isTrending}
                onChange={setIsTrending}
              />
              <Toggle label="Active" value={isActive} onChange={setIsActive} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={createTopic}
            disabled={!title.trim() || loading}
            className={cx(
              "rounded-xl px-4 py-2 text-[13px] font-semibold transition",
              "bg-violet-600 text-white hover:bg-violet-500",
              (!title.trim() || loading) && "opacity-60 cursor-not-allowed"
            )}
          >
            Create
          </button>
        </div>
      </div>

      {/* List card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-slate-100">
              All topics
            </h2>
            <p className="text-[12px] text-slate-400 mt-1">
              Search, filter and update topics. Trending ones appear first.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="w-full md:w-72 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60"
              placeholder="Search title / description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as "ALL" | TopicCategory)
              }
            >
              <option value="ALL">All categories</option>
              <option value="DAILY">Daily</option>
              <option value="OFFICIAL">Official</option>
              <option value="NORMAL">Normal</option>
            </select>

            <select
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
              }
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
              value={filterTrending}
              onChange={(e) =>
                setFilterTrending(e.target.value as "ALL" | "TRENDING")
              }
            >
              <option value="ALL">All</option>
              <option value="TRENDING">Trending only</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[900px] w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-300 border-b border-slate-800">
                <th className="py-3 pr-3">Title</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Trending</th>
                <th className="py-3 pr-3">Active</th>
                <th className="py-3 pr-3">Sort</th>
                <th className="py-3 pr-3">Hot</th>
                <th className="py-3 pr-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredSortedTopics.map((t) => (
                <TopicRowItem
                  key={t.id}
                  topic={t}
                  saving={savingId === t.id}
                  onSave={(next) => saveTopic({ id: t.id, ...next })}
                />
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredSortedTopics.length === 0 && (
          <div className="mt-4 text-[13px] text-slate-400">
            No topics found.
          </div>
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
  const [local, setLocal] = useState<TopicRow>(topic);

  useEffect(() => {
    setLocal(topic);
  }, [topic]);

  const dirty =
    local.title !== topic.title ||
    (local.description ?? "") !== (topic.description ?? "") ||
    local.category !== topic.category ||
    local.isTrending !== topic.isTrending ||
    local.isActive !== topic.isActive ||
    local.sortOrder !== topic.sortOrder ||
    local.hotCount !== topic.hotCount;

  return (
    <tr className="text-slate-100">
      <td className="py-3 pr-3">
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60"
          value={local.title}
          onChange={(e) => setLocal((p) => ({ ...p, title: e.target.value }))}
        />
        <input
          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/50"
          placeholder="Description (optional)"
          value={local.description ?? ""}
          onChange={(e) =>
            setLocal((p) => ({
              ...p,
              description: e.target.value.trim() ? e.target.value : null,
            }))
          }
        />
      </td>

      <td className="py-3 pr-3 align-top">
        <select
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
          value={local.category}
          onChange={(e) =>
            setLocal((p) => ({ ...p, category: e.target.value as TopicCategory }))
          }
        >
          <option value="DAILY">Daily</option>
          <option value="OFFICIAL">Official</option>
          <option value="NORMAL">Normal</option>
        </select>

        <div className="mt-2">
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300">
            {categoryLabel[local.category]}
          </span>
        </div>
      </td>

      <td className="py-3 pr-3 align-top">
        <ToggleCompact
          value={local.isTrending}
          onChange={(v) => setLocal((p) => ({ ...p, isTrending: v }))}
        />
      </td>

      <td className="py-3 pr-3 align-top">
        <ToggleCompact
          value={local.isActive}
          onChange={(v) => setLocal((p) => ({ ...p, isActive: v }))}
        />
      </td>

      <td className="py-3 pr-3 align-top">
        <input
          className="w-24 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
          type="number"
          value={local.sortOrder}
          onChange={(e) =>
            setLocal((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))
          }
        />
      </td>

      <td className="py-3 pr-3 align-top">
        <input
          className="w-24 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[13px] text-slate-100 outline-none focus:border-violet-500/60"
          type="number"
          value={local.hotCount}
          onChange={(e) =>
            setLocal((p) => ({ ...p, hotCount: Number(e.target.value) || 0 }))
          }
        />
      </td>

      <td className="py-3 pr-3 align-top">
        <button
          className={cx(
            "rounded-xl px-3.5 py-2 text-[13px] font-semibold border transition",
            dirty
              ? "border-violet-500/40 bg-violet-600 text-white hover:bg-violet-500"
              : "border-slate-700 bg-slate-900/60 text-slate-300 cursor-not-allowed",
            saving && "opacity-60 cursor-not-allowed"
          )}
          disabled={!dirty || saving}
          onClick={() =>
            onSave({
              title: local.title.trim(),
              description: local.description,
              category: local.category,
              isTrending: local.isTrending,
              isActive: local.isActive,
              sortOrder: local.sortOrder,
              hotCount: local.hotCount,
            })
          }
        >
          {saving ? "Saving..." : dirty ? "Save" : "Saved"}
        </button>
      </td>
    </tr>
  );
}

/* UI helpers */
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
    <div className={className}>
      <div className="text-[11px] font-medium text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-200">
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
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] transition",
        value
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-950/60"
      )}
      aria-pressed={value}
    >
      <span
        className={cx(
          "h-2.5 w-2.5 rounded-full",
          value ? "bg-emerald-400" : "bg-slate-500"
        )}
      />
      {label}
    </button>
  );
}

function ToggleCompact({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cx(
        "h-9 w-14 rounded-full border transition relative",
        value
          ? "border-emerald-500/40 bg-emerald-500/20"
          : "border-slate-700 bg-slate-950/40"
      )}
      aria-pressed={value}
    >
      <span
        className={cx(
          "absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full transition",
          value ? "left-7 bg-emerald-400" : "left-1 bg-slate-400"
        )}
      />
    </button>
  );
}
