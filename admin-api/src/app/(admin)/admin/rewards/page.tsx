"use client";

import React, { useEffect, useMemo, useState } from "react";

type Category = "PK_MISSION" | "ACTIVITY" | "FAN_CLUB" | "INVITE";
type Metric = "NONE" | "COINS_RECEIVED" | "COINS_SENT" | "PK_BATTLES" | "PK_WINS" | "INVITES";
type Period = "TODAY" | "WEEK" | "MONTH" | "ALL_TIME";

type RewardTask = {
  id: string;
  category: Category;
  title: string;
  subtitle?: string | null;
  rewardPoints: number;
  target: number;
  metric: Metric;
  period: Period;
  goToScreen?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

const CATEGORY_LABEL: Record<Category, string> = {
  PK_MISSION: "PK Mission",
  ACTIVITY: "Activity",
  FAN_CLUB: "Fan Club",
  INVITE: "Invite",
};

const METRIC_LABEL: Record<Metric, string> = {
  NONE: "None (manual)",
  COINS_RECEIVED: "Coins Received",
  COINS_SENT: "Coins Sent",
  PK_BATTLES: "PK Battles",
  PK_WINS: "PK Wins",
  INVITES: "Invites",
};

const PERIOD_LABEL: Record<Period, string> = {
  TODAY: "Today",
  WEEK: "Last 7 Days",
  MONTH: "This Month",
  ALL_TIME: "All Time",
};

export default function AdminRewardsPage() {
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: "PK_MISSION" as Category,
    title: "",
    subtitle: "",
    rewardPoints: 100,
    target: 1,
    metric: "NONE" as Metric,
    period: "TODAY" as Period,
    goToScreen: "VipCenter",
    isActive: true,
    sortOrder: 0,
  });

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reward-tasks", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setTasks(Array.isArray(json?.tasks) ? json.tasks : []);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<Category, RewardTask[]> = {
      PK_MISSION: [],
      ACTIVITY: [],
      FAN_CLUB: [],
      INVITE: [],
    };
    for (const t of tasks) map[t.category]?.push(t);
    return map;
  }, [tasks]);

  async function createTask() {
    setErr(null);
    try {
      if (!form.title.trim()) {
        setErr("Title is required.");
        return;
      }

      const res = await fetch("/api/admin/reward-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");

      await load();
      setForm((f) => ({ ...f, title: "", subtitle: "" }));
    } catch (e: any) {
      setErr(e?.message || "Error");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/reward-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    await load();
  }

  async function removeTask(id: string) {
    await fetch(`/api/admin/reward-tasks/${id}`, { method: "DELETE" });
    await load();
  }

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={[
        "mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100",
        "outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10",
        props.className ?? "",
      ].join(" ")}
    />
  );

  const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
      {...props}
      className={[
        "mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100",
        "outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10",
        props.className ?? "",
      ].join(" ")}
    >
      {props.children}
    </select>
  );

  const Option = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value} style={{ backgroundColor: "#0b1220", color: "#ffffff" }}>
      {children}
    </option>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rewards</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage reward tasks shown in the mobile app (real-time from DB).
          </p>
        </div>
        <div className="text-xs text-slate-400">
          {loading ? "Loading…" : `${tasks.length} total tasks`}
        </div>
      </header>

      {err && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      {/* Create card */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold">Create Reward Task</h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Tip: choose a Metric + Period to make “current” update automatically.
          </p>
        </div>

        <div className="px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-xs text-slate-300">Category</label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              >
                <Option value="PK_MISSION">PK Mission</Option>
                <Option value="ACTIVITY">Activity</Option>
                <Option value="FAN_CLUB">Fan Club</Option>
                <Option value="INVITE">Invite</Option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-300">Go To Screen (mobile route)</label>
              <Input
                value={form.goToScreen}
                onChange={(e) => setForm({ ...form, goToScreen: e.target.value })}
                placeholder="VipCenter / Explore / LiveApplication ..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Complete a round of Team PK"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Subtitle</label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Can only be achieved once"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Reward Points</label>
                <Input
                  type="number"
                  value={form.rewardPoints}
                  onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Target</label>
                <Input
                  type="number"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Metric (auto current)</label>
                <Select
                  value={form.metric}
                  onChange={(e) => setForm({ ...form, metric: e.target.value as Metric })}
                >
                  {Object.keys(METRIC_LABEL).map((m) => (
                    <Option key={m} value={m}>
                      {METRIC_LABEL[m as Metric]}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-300">Period</label>
                <Select
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value as Period })}
                >
                  {Object.keys(PERIOD_LABEL).map((p) => (
                    <Option key={p} value={p}>
                      {PERIOD_LABEL[p as Period]}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 accent-yellow-400"
                  />
                  Active
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={createTask}
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15"
          >
            Create Task
          </button>
        </div>
      </section>

      {/* Lists */}
      <section className="space-y-4">
        {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => (
          <div key={cat} className="rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">{CATEGORY_LABEL[cat]}</h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  {grouped[cat]?.length ?? 0} task(s)
                </p>
              </div>
            </div>

            <div className="p-4">
              {grouped[cat]?.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="text-slate-400">
                      <tr className="border-b border-slate-800">
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Title</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Points</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Target</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Metric</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Period</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Go To</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Sort</th>
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wide">Status</th>
                        <th className="px-2 py-2 text-right text-[11px] uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[cat].map((t) => (
                        <tr key={t.id} className="border-b border-slate-900/80 hover:bg-slate-900/60">
                          <td className="px-2 py-3">
                            <div className="font-medium text-slate-100">{t.title}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">
                              {t.subtitle ? t.subtitle : "—"}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-slate-100">{t.rewardPoints}</td>
                          <td className="px-2 py-3 text-slate-100">{t.target}</td>
                          <td className="px-2 py-3 text-slate-100">{METRIC_LABEL[t.metric]}</td>
                          <td className="px-2 py-3 text-slate-100">{PERIOD_LABEL[t.period]}</td>
                          <td className="px-2 py-3 text-slate-100">{t.goToScreen ?? "—"}</td>
                          <td className="px-2 py-3 text-slate-100">{t.sortOrder}</td>
                          <td className="px-2 py-3">
                            <span
                              className={[
                                "rounded-full border px-2.5 py-1 text-[11px]",
                                t.isActive
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                  : "border-slate-600/40 bg-slate-800/40 text-slate-300",
                              ].join(" ")}
                            >
                              {t.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => toggleActive(t.id, !t.isActive)}
                                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900"
                              >
                                {t.isActive ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => removeTask(t.id)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
