"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../../lib/adminApi";

type Feedback = {
  id: string;
  createdAt: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  type: "MY_FEEDBACK" | "MESSAGE_FEEDBACK";
  message: string;
  replyText?: string | null;
  user: { id: string; username: string; email?: string | null };
};

export default function AdminHelpFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [status, setStatus] = useState("OPEN");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet<Feedback[]>(
        `/api/admin/help/feedback?status=${encodeURIComponent(status)}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function reply(row: Feedback) {
    const text = prompt("Reply to user:", row.replyText ?? "");
    if (!text) return;
    await apiPost(`/api/admin/help/feedback/${encodeURIComponent(row.id)}/reply`, { replyText: text });
    await load();
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">Help • Feedback</h1>
        <div className="ml-auto flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="OPEN">Open</option>
            <option value="REPLIED">Replied</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No feedback found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="border rounded p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    {new Date(f.createdAt).toLocaleString()} • {f.status} • {f.type}
                  </div>
                  <div className="font-semibold mt-1">
                    {f.user.username} {f.user.email ? `(${f.user.email})` : ""}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">{f.message}</div>

                  {f.replyText ? (
                    <div className="mt-3 border-l-4 pl-3 text-sm text-gray-700">
                      <div className="font-semibold">Reply</div>
                      <div className="whitespace-pre-wrap">{f.replyText}</div>
                    </div>
                  ) : null}
                </div>

                <button className="border rounded px-2 py-1 text-sm" onClick={() => reply(f)}>
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
