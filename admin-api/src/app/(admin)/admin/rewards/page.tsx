"use client";

import React, { useEffect, useMemo, useState } from "react";

type Category = "PK_MISSION" | "ACTIVITY" | "FAN_CLUB" | "INVITE";

type RewardTask = {
  id: string;
  category: Category;
  title: string;
  subtitle?: string | null;
  rewardPoints: number;
  target: number;
  goToScreen?: string | null;
  isActive: boolean;
  sortOrder: number;
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
    goToScreen: "VipCenter",
    isActive: true,
    sortOrder: 0,
  });

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reward-tasks");
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
    const map: Record<string, RewardTask[]> = { PK_MISSION: [], ACTIVITY: [], FAN_CLUB: [], INVITE: [] };
    for (const t of tasks) map[t.category]?.push(t);
    return map;
  }, [tasks]);

  async function createTask() {
    setErr(null);
    try {
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

  async function remove(id: string) {
    await fetch(`/api/admin/reward-tasks/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Rewards</h1>

      {err && <div style={{ marginBottom: 12, color: "crimson" }}>{err}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading…</div>}

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Create Reward Task</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
            >
              <option value="PK_MISSION">PK Mission</option>
              <option value="ACTIVITY">Activity</option>
              <option value="FAN_CLUB">Fan Club</option>
              <option value="INVITE">Invite</option>
            </select>
          </label>

          <label>
            Go To Screen (mobile route)
            <input
              value={form.goToScreen}
              onChange={(e) => setForm({ ...form, goToScreen: e.target.value })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
              placeholder="VipCenter / Explore / LiveApplication ..."
            />
          </label>

          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
              placeholder="Complete a round of Team PK"
            />
          </label>

          <label>
            Subtitle
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
              placeholder="Can only be achieved once"
            />
          </label>

          <label>
            Reward Points
            <input
              type="number"
              value={form.rewardPoints}
              onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label>
            Target
            <input
              type="number"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label>
            Sort Order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <button
          onClick={createTask}
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create
        </button>
      </div>

      {(["PK_MISSION", "ACTIVITY", "FAN_CLUB", "INVITE"] as Category[]).map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{cat}</h3>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12 }}>
            {(grouped[cat] ?? []).map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 12,
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {t.subtitle || "-"} • +{t.rewardPoints} • target {t.target} • goTo {t.goToScreen || "-"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    onClick={() => toggleActive(t.id, !t.isActive)}
                    style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                  >
                    {t.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ef4444", color: "#ef4444" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(grouped[cat] ?? []).length === 0 && (
              <div style={{ padding: 12, color: "#6b7280" }}>No tasks.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
