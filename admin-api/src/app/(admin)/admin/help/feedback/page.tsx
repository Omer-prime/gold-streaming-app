"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../../../../lib/adminApi";

type Feedback = {
  id: string;
  createdAt: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  type: "MY_FEEDBACK" | "MESSAGE_FEEDBACK";
  category?: string | null;
  subject?: string | null;
  message: string;
  replyText?: string | null;
  user: { id: string; username: string; email?: string | null };
};

type PageResp<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fmtDate(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString();
}

function badgeBase() {
  return "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border";
}

function statusBadge(status: Feedback["status"]) {
  switch (status) {
    case "OPEN":
      return `${badgeBase()} border-rose-500/30 bg-rose-500/10 text-rose-200`;
    case "REPLIED":
      return `${badgeBase()} border-emerald-500/30 bg-emerald-500/10 text-emerald-200`;
    case "CLOSED":
      return `${badgeBase()} border-slate-500/30 bg-slate-500/10 text-slate-200`;
    default:
      return `${badgeBase()} border-slate-500/30 bg-slate-500/10 text-slate-200`;
  }
}

function typeBadge(type: Feedback["type"]) {
  const label = type === "MY_FEEDBACK" ? "My feedback" : "Message";
  return `${badgeBase()} border-slate-600/40 bg-slate-900/50 text-slate-200` + `__${label}`;
}

export default function AdminHelpFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [status, setStatus] = useState<Feedback["status"]>("OPEN");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((f) => {
      const hay = [
        f.user?.username,
        f.user?.email,
        f.type,
        f.status,
        f.category,
        f.subject,
        f.message,
        f.replyText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  async function load(p = page) {
    setLoading(true);
    setErr("");
    try {
      const data = await apiGet<PageResp<Feedback>>(
        `/api/admin/help/feedback?status=${encodeURIComponent(status)}&page=${p}&limit=${limit}`
      );
      setItems(data.items ?? []);
      setPage(data.page ?? p);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setItems([]);
      setTotalPages(1);
      setTotal(0);
      setErr(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function reply(row: Feedback) {
    const text = prompt("Reply to user:", row.replyText ?? "");
    if (!text) return;
    await apiPost(`/api/admin/help/feedback/${encodeURIComponent(row.id)}/reply`, { replyText: text });
    await load(page);
  }

  function TypePill({ type }: { type: Feedback["type"] }) {
    const label = type === "MY_FEEDBACK" ? "My feedback" : "Message";
    return <span className={`${badgeBase()} border-slate-700 bg-slate-900/40 text-slate-200`}>{label}</span>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Help • Feedback</h1>
          <p className="text-[12px] text-slate-400">
            View user feedback, reply, and track status. ({total} total)
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {/* Search */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search user, email, subject, message..."
              className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-400/60"
            />
            {q ? (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 hover:border-slate-700"
                title="Clear"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* Status filter */}
          <select
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-yellow-400/60"
            value={status}
            onChange={(e) => setStatus(e.target.value as Feedback["status"])}
          >
            <option value="OPEN">Open</option>
            <option value="REPLIED">Replied</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={() => load(page)}
            disabled={loading}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold border",
              loading
                ? "border-slate-800 bg-slate-900/30 text-slate-500"
                : "border-slate-700 bg-slate-900/60 text-slate-100 hover:border-slate-600"
            )}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {err ? (
        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-200">
          <div className="text-sm font-semibold">Failed to fetch</div>
          <div className="text-xs opacity-90">{err}</div>
        </div>
      ) : null}

      {/* Content */}
      <div className="rounded-2xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-950/60 p-3">
        {loading ? (
          <div className="py-14 text-center text-slate-400">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-slate-200 font-semibold">No feedback found</div>
            <div className="text-slate-500 text-sm mt-1">
              Try changing status or search.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((f) => {
              const expanded = expandedId === f.id;
              return (
                <div
                  key={f.id}
                  className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 hover:border-slate-800 transition-colors"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    {/* left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusBadge(f.status)}>{f.status}</span>
                        <TypePill type={f.type} />
                        {f.category ? (
                          <span className={`${badgeBase()} border-indigo-500/30 bg-indigo-500/10 text-indigo-200`}>
                            {f.category}
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-500">{fmtDate(f.createdAt)}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="text-[14px] font-semibold text-slate-100">
                          {f.user.username}
                        </div>
                        {f.user.email ? (
                          <div className="text-xs text-slate-400">({f.user.email})</div>
                        ) : null}
                      </div>

                      {f.subject ? (
                        <div className="mt-2 rounded-xl border border-slate-900 bg-slate-950/40 px-3 py-2">
                          <div className="text-[12px] font-semibold text-slate-200">Subject</div>
                          <div className="text-sm text-slate-200">{f.subject}</div>
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <div className="text-[12px] font-semibold text-slate-300 mb-1">Message</div>
                        <div
                          className={cx(
                            "text-sm text-slate-100 whitespace-pre-wrap leading-6",
                            !expanded && "line-clamp-3 text-slate-200/90"
                          )}
                        >
                          {f.message}
                        </div>

                        {f.message.length > 240 ? (
                          <button
                            onClick={() => setExpandedId(expanded ? null : f.id)}
                            className="mt-2 text-xs font-semibold text-yellow-300 hover:text-yellow-200"
                          >
                            {expanded ? "Show less" : "Read more"}
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-3">
                        {f.replyText ? (
                          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 py-3">
                            <div className="text-[12px] font-semibold text-emerald-200">
                              Admin reply
                            </div>
                            <div className="mt-1 text-sm text-emerald-50 whitespace-pre-wrap">
                              {f.replyText}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-900 bg-slate-950/40 px-3 py-3">
                            <div className="text-[12px] font-semibold text-slate-300">
                              No reply yet
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Reply to mark as replied.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* right actions */}
                    <div className="flex md:flex-col gap-2 md:items-end">
                      <button
                        className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 hover:border-slate-700"
                        onClick={() => navigator.clipboard?.writeText(f.id)}
                        title="Copy feedback id"
                      >
                        Copy ID
                      </button>

                      <button
                        className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15"
                        onClick={() => reply(f)}
                      >
                        {f.replyText ? "Edit reply" : "Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-900 pt-4">
          <div className="text-sm text-slate-400">
            Page <span className="text-slate-100 font-semibold">{page}</span> /{" "}
            <span className="text-slate-100 font-semibold">{totalPages}</span>
          </div>

          <div className="flex gap-2">
            <button
              className={cx(
                "rounded-xl px-3 py-2 text-sm font-semibold border",
                page <= 1 || loading
                  ? "border-slate-900 bg-slate-900/20 text-slate-600"
                  : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-700"
              )}
              disabled={page <= 1 || loading}
              onClick={() => load(page - 1)}
            >
              Prev
            </button>

            <button
              className={cx(
                "rounded-xl px-3 py-2 text-sm font-semibold border",
                page >= totalPages || loading
                  ? "border-slate-900 bg-slate-900/20 text-slate-600"
                  : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-700"
              )}
              disabled={page >= totalPages || loading}
              onClick={() => load(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
