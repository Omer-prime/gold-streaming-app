"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type Audience = "ALL_USERS" | "ALL_HOSTS" | "SPECIFIC_USERS";

export default function CreateNotificationPage() {
  const [audience, setAudience] = useState<Audience>("ALL_USERS");
  const [type, setType] = useState("ADMIN");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [identifiersText, setIdentifiersText] = useState(""); // usernames/emails/ids
  const [metaText, setMetaText] = useState(""); // JSON
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const identifiers = useMemo(() => {
    return identifiersText
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [identifiersText]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      setError("Title and body are required.");
      return;
    }

    if (audience === "SPECIFIC_USERS" && identifiers.length === 0) {
      setError("Add at least 1 username/email/userId for SPECIFIC_USERS.");
      return;
    }

    let metaJson: any = null;
    if (metaText.trim()) {
      try {
        metaJson = JSON.parse(metaText);
      } catch {
        setError("Meta JSON is invalid. Either fix it or leave it empty.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          audience,
          identifiers: audience === "SPECIFIC_USERS" ? identifiers : undefined,
          type: type.trim() || "ADMIN",
          title: t,
          body: b,
          metaJson: metaJson ?? undefined,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error ?? "Failed to send notification");
        return;
      }

      setResult(json);
      setTitle("");
      setBody("");
      setIdentifiersText("");
      setMetaText("");
      setType("ADMIN");
      setAudience("ALL_USERS");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Notification</h1>
          <p className="mt-1 text-sm text-slate-400">
            This will appear inside the app notifications list for targeted users.
          </p>
        </div>

        <Link
          href="/admin"
          className="text-xs rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-slate-200 hover:border-yellow-400/60"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            >
              <option value="ALL_USERS">All Users</option>
              <option value="ALL_HOSTS">All Hosts</option>
              <option value="SPECIFIC_USERS">Specific Users</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Type</label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="ADMIN"
              className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
            <p className="text-[11px] text-slate-500">Example: ADMIN, SYSTEM, MESSAGE</p>
          </div>
        </div>

        {audience === "SPECIFIC_USERS" && (
          <div className="space-y-1">
            <label className="text-xs text-slate-300">User identifiers</label>
            <textarea
              value={identifiersText}
              onChange={(e) => setIdentifiersText(e.target.value)}
              rows={4}
              placeholder="Enter usernames/emails/userIds, separated by commas or new lines"
              className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
            <p className="text-[11px] text-slate-500">
              Found: <span className="text-slate-200 font-medium">{identifiers.length}</span>
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Maintenance notice"
            className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Write message here..."
            className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Meta JSON (optional)</label>
          <textarea
            value={metaText}
            onChange={(e) => setMetaText(e.target.value)}
            rows={4}
            placeholder='{"screen":"Notifications"}'
            className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />
          <p className="text-[11px] text-slate-500">Leave empty if you don’t need extra data.</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-yellow-400 text-slate-950 py-2 text-sm font-semibold disabled:opacity-60 hover:bg-yellow-300"
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>

        {result && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-200">
            <div className="font-semibold">✅ Sent</div>
            <div className="mt-1 text-slate-400">
              Audience: <span className="text-slate-100">{result.audience}</span> •
              Targeted: <span className="text-slate-100">{result.targeted}</span>
            </div>
            <div className="mt-1 text-slate-400">
              Campaign ID: <span className="text-slate-100">{result.adminNotificationId}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
