"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut } from "../../../../lib/adminApi";

const LANGS = [
  { code: "system", label: "Follow system" },
  { code: "en", label: "English" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "hi", label: "हिंदी" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "pt", label: "Português" },
  { code: "tr", label: "Türkçe" },
  { code: "bn", label: "বাংলা" },
  { code: "th", label: "ภาษาไทย" },
  { code: "ne", label: "नेपाली" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

type Category = {
  id: string;
  key: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
};

type Faq = {
  id: string;
  categoryId: string;
  isActive: boolean;
  sortOrder: number;
  question: string;
  answer: string;
};

type PageResp<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-300">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-0 top-12 mx-auto w-[94%] max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminHelpFaqsPage() {
  const [lang, setLang] = useState("en");

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCatId, setActiveCatId] = useState<string>("");

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // search
  const [q, setQ] = useState("");

  // modal form
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeCat = useMemo(
    () => categories.find((c) => c.id === activeCatId),
    [categories, activeCatId]
  );

  const filteredFaqs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(s) ||
        f.answer.toLowerCase().includes(s)
    );
  }, [faqs, q]);

  function niceErr(e: any) {
    if (!e) return "Unknown error";
    if (typeof e === "string") return e;
    if (e?.message) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return "Unknown error";
    }
  }

  async function loadAll(nextLang = lang, nextCatId?: string, nextPage = 1) {
    setLoading(true);
    setErr(null);
    try {
      // IMPORTANT: backend should auto-seed default categories
      const cats = await apiGet<Category[]>(
        `/api/admin/help/categories?lang=${encodeURIComponent(nextLang)}`
      );

      setCategories(cats);

      const chosenCatId =
        nextCatId && cats.some((c) => c.id === nextCatId)
          ? nextCatId
          : cats[0]?.id ?? "";

      setActiveCatId(chosenCatId);
      setPage(nextPage);

      if (chosenCatId) {
        const data = await apiGet<PageResp<Faq>>(
          `/api/admin/help/faqs?lang=${encodeURIComponent(nextLang)}&categoryId=${encodeURIComponent(
            chosenCatId
          )}&page=${nextPage}&limit=${limit}`
        );

        setFaqs(data.items ?? []);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || nextPage);
      } else {
        setFaqs([]);
        setTotalPages(1);
      }
    } catch (e: any) {
      setErr(niceErr(e));
      setCategories([]);
      setActiveCatId("");
      setFaqs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  async function loadFaqPage(p: number) {
    if (!activeCatId) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await apiGet<PageResp<Faq>>(
        `/api/admin/help/faqs?lang=${encodeURIComponent(lang)}&categoryId=${encodeURIComponent(
          activeCatId
        )}&page=${p}&limit=${limit}`
      );
      setFaqs(data.items ?? []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || p);
    } catch (e: any) {
      setErr(niceErr(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // when language changes, reset to page 1
    loadAll(lang, undefined, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function onSelectCategory(catId: string) {
    setQ("");
    await loadAll(lang, catId, 1);
  }

  function openCreate() {
    if (!activeCatId) return;
    setEditing(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormSortOrder(0);
    setFormIsActive(true);
    setModalOpen(true);
  }

  function openEdit(f: Faq) {
    setEditing(f);
    setFormQuestion(f.question ?? "");
    setFormAnswer(f.answer ?? "");
    setFormSortOrder(Number.isFinite(f.sortOrder) ? f.sortOrder : 0);
    setFormIsActive(!!f.isActive);
    setModalOpen(true);
  }

  async function saveFaq() {
    if (!activeCatId) return;

    if (!formQuestion.trim()) {
      setErr("Question is required.");
      return;
    }

    setSaving(true);
    setErr(null);
    try {
      if (editing) {
        await apiPut(`/api/admin/help/faqs/${encodeURIComponent(editing.id)}`, {
          lang,
          question: formQuestion.trim(),
          answer: formAnswer ?? "",
          sortOrder: Number(formSortOrder) || 0,
          isActive: !!formIsActive,
        });
        setModalOpen(false);
        await loadFaqPage(page);
      } else {
        await apiPost(`/api/admin/help/faqs`, {
          lang,
          categoryId: activeCatId,
          question: formQuestion.trim(),
          answer: formAnswer ?? "",
          sortOrder: Number(formSortOrder) || 0,
          isActive: !!formIsActive,
        });
        setModalOpen(false);
        await loadFaqPage(1);
      }
    } catch (e: any) {
      setErr(niceErr(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Help • FAQs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage FAQ categories & translations (per language).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={cx(
              "rounded-xl border px-3 py-2 text-sm outline-none",
              "border-slate-800 bg-slate-950 text-slate-100",
              "focus:ring-2 focus:ring-yellow-500/30"
            )}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option
                key={l.code}
                value={l.code}
                className="bg-slate-950 text-slate-100"
              >
                {l.label}
              </option>
            ))}
          </select>

          <button
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold",
              "bg-yellow-400 text-black hover:bg-yellow-300",
              (!activeCatId || loading) && "opacity-60 pointer-events-none"
            )}
            onClick={openCreate}
            title={!activeCatId ? "No categories found" : "Add FAQ"}
          >
            + Add FAQ
          </button>
        </div>
      </div>

      {/* error */}
      {err ? (
        <div className="mb-4 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* categories */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-100">
              Categories
            </div>
            {loading ? <Spinner /> : null}
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-400">
              No categories found.
              <div className="mt-2 text-xs text-slate-500">
                Fix: ensure backend seeds default HelpCategory rows (see routes
                below).
              </div>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {categories.map((c) => {
                const active = c.id === activeCatId;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategory(c.id)}
                    className={cx(
                      "mb-2 w-full rounded-xl border px-3 py-2 text-left transition",
                      active
                        ? "border-yellow-500/40 bg-yellow-500/10"
                        : "border-slate-800 bg-slate-950 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-100">
                        {c.title || c.key}
                      </div>
                      <span
                        className={cx(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                        )}
                      >
                        {c.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{c.key}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* faqs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Showing:{" "}
              <span className="font-semibold text-slate-100">
                {activeCat?.title ?? "-"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search question / answer…"
                className="w-full sm:w-[320px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-yellow-500/30"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12">
              <div className="mx-auto w-fit">
                <Spinner label="Loading FAQs…" />
              </div>
            </div>
          ) : !activeCatId ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Select a category to view FAQs.
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No FAQs in this category.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-100">
                          {f.question}
                        </div>
                        <span
                          className={cx(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold border",
                            f.isActive
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-500/20 bg-slate-500/10 text-slate-300"
                          )}
                        >
                          {f.isActive ? "Active" : "Hidden"}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-[11px] text-slate-300">
                          sort: {f.sortOrder}
                        </span>
                      </div>

                      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                        {f.answer}
                      </div>
                    </div>

                    <button
                      onClick={() => openEdit(f)}
                      className="shrink-0 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-900"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* pagination */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Page <span className="text-slate-100">{page}</span> /{" "}
              <span className="text-slate-100">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
                disabled={page <= 1 || loading || !activeCatId}
                onClick={() => loadFaqPage(page - 1)}
              >
                Prev
              </button>
              <button
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
                disabled={page >= totalPages || loading || !activeCatId}
                onClick={() => loadFaqPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      <Modal
        open={modalOpen}
        title={
          editing
            ? `Edit FAQ (${lang})`
            : `Add FAQ (${lang}) • ${activeCat?.title ?? ""}`
        }
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={saveFaq}
              disabled={saving}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-300">
              Question
            </div>
            <input
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-yellow-500/30"
              placeholder="Type the FAQ question…"
            />
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-slate-300">
              Answer
            </div>
            <textarea
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-yellow-500/30"
              placeholder="Type the answer…"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-300">
                Sort order
              </div>
              <input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-yellow-500/30"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                Active (visible in app)
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
