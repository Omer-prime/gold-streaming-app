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

type Category = { id: string; key: string; title: string; sortOrder: number; isActive: boolean };
type Faq = {
  id: string;
  categoryId: string;
  isActive: boolean;
  sortOrder: number;
  question: string;
  answer: string;
};

export default function AdminHelpFaqsPage() {
  const [lang, setLang] = useState("en");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCatId, setActiveCatId] = useState<string>("");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);

  const activeCat = useMemo(() => categories.find((c) => c.id === activeCatId), [categories, activeCatId]);

  async function loadAll() {
    setLoading(true);
    try {
      const cats = await apiGet<Category[]>(`/api/admin/help/categories?lang=${encodeURIComponent(lang)}`);
      setCategories(cats);
      const firstId = cats[0]?.id ?? "";
      setActiveCatId((prev) => prev || firstId);

      const catToUse = activeCatId || firstId;
      if (catToUse) {
        const list = await apiGet<Faq[]>(
          `/api/admin/help/faqs?lang=${encodeURIComponent(lang)}&categoryId=${encodeURIComponent(catToUse)}`
        );
        setFaqs(list);
      } else {
        setFaqs([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadFaqs(catId: string) {
    setLoading(true);
    try {
      const list = await apiGet<Faq[]>(
        `/api/admin/help/faqs?lang=${encodeURIComponent(lang)}&categoryId=${encodeURIComponent(catId)}`
      );
      setFaqs(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (activeCatId) loadFaqs(activeCatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatId]);

  async function createFaq() {
    if (!activeCatId) return;
    const question = prompt("Question (current language)?");
    if (!question) return;
    const answer = prompt("Answer (current language)?") ?? "";
    await apiPost(`/api/admin/help/faqs`, { lang, categoryId: activeCatId, question, answer });
    await loadFaqs(activeCatId);
  }

  async function editFaq(f: Faq) {
    const question = prompt("Edit question", f.question);
    if (!question) return;
    const answer = prompt("Edit answer", f.answer) ?? "";
    await apiPut(`/api/admin/help/faqs/${encodeURIComponent(f.id)}`, { lang, question, answer });
    await loadFaqs(activeCatId);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">Help • FAQs</h1>

        <div className="ml-auto flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button className="rounded bg-black text-white px-3 py-1" onClick={createFaq}>
            + Add FAQ
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64 border rounded p-3">
          <div className="font-semibold mb-2">Categories</div>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`w-full text-left px-3 py-2 rounded mb-1 ${c.id === activeCatId ? "bg-gray-100" : ""}`}
              onClick={() => setActiveCatId(c.id)}
            >
              <div className="text-sm font-medium">{c.title}</div>
              <div className="text-xs text-gray-500">{c.key}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 border rounded p-3">
          <div className="mb-2 text-sm text-gray-600">
            Showing: <span className="font-semibold">{activeCat?.title ?? "-"}</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : faqs.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No FAQs in this category.</div>
          ) : (
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="border rounded p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{f.question}</div>
                      <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{f.answer}</div>
                    </div>
                    <button className="border rounded px-2 py-1 text-sm" onClick={() => editFaq(f)}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
