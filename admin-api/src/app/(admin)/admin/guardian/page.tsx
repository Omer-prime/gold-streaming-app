"use client";

import React, { useEffect, useMemo, useState } from "react";

type GuardianTierApi = "NONE" | "SILVER" | "GOLD" | "DIAMOND";

type Priv = { key: string; label: string; value?: string; locked?: boolean; icon?: string | null };

type Pkg = {
  id?: string;
  label: string;
  durationMonths: number;
  priceCoins: number;
  isActive?: boolean;
  sortOrder?: number;
};

type GuardianPlanUi = {
  id: string;
  tier: GuardianTierApi;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  packages: Pkg[];
  privileges: Priv[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizePlan(p: any): GuardianPlanUi {
  const packages = Array.isArray(p?.packages) ? p.packages : [];
  const planPrivileges = Array.isArray(p?.planPrivileges) ? p.planPrivileges : [];

  return {
    id: String(p.id),
    tier: p.tier,
    name: String(p.name ?? ""),
    description: p.description ?? "",
    isActive: Boolean(p.isActive),
    sortOrder: Number(p.sortOrder ?? 0) || 0,
    packages: packages
      .map((x: any) => ({
        id: String(x.id),
        label: String(x.label ?? ""),
        durationMonths: Number(x.durationMonths ?? 0) || 0,
        priceCoins: Number(x.priceCoins ?? 0) || 0,
        isActive: Boolean(x.isActive ?? true),
        sortOrder: Number(x.sortOrder ?? 0) || 0,
      }))
      .sort((a: Pkg, b: Pkg) => (a.durationMonths ?? 0) - (b.durationMonths ?? 0)),
    privileges: planPrivileges.map((l: any) => ({
      key: String(l?.privilege?.key ?? ""),
      label: String(l?.privilege?.label ?? ""),
      value: l?.valueOverride ?? l?.privilege?.defaultValue ?? "",
      locked: Boolean(l?.locked ?? false),
      icon: l?.privilege?.icon ?? null,
    })),
  };
}

export default function AdminGuardianPage() {
  const [plans, setPlans] = useState<GuardianPlanUi[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? plans[0] ?? null,
    [plans, selectedId]
  );

  const [draft, setDraft] = useState<GuardianPlanUi | null>(null);

  // create plan form
  const [newTier, setNewTier] = useState<Exclude<GuardianTierApi, "NONE">>("SILVER");
  const [newName, setNewName] = useState("");

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p) => p.isActive).length;
    return { total, active };
  }, [plans]);

  async function load() {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/guardian/plans", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load Guardian plans");

      const list = Array.isArray(json?.plans) ? json.plans.map(normalizePlan) : [];
      setPlans(list);
      if (!selectedId && list[0]?.id) setSelectedId(list[0].id);
    } catch (e: any) {
      setErr(e?.message || "Error");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) setDraft(JSON.parse(JSON.stringify(selected)));
  }, [selected?.id]);

  const dirty = useMemo(() => {
    if (!draft || !selected) return false;
    return JSON.stringify(draft) !== JSON.stringify(selected);
  }, [draft, selected]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/guardian/plans/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description ?? "",
          sortOrder: draft.sortOrder,
          isActive: draft.isActive,
          packages: draft.packages ?? [],
          privileges: draft.privileges ?? [],
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Save failed");

      setNotice("Guardian plan saved ✅");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function createPlan() {
    setErr(null);
    setNotice(null);
    const name = newName.trim();
    if (!name) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/guardian/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier, name, isActive: true, sortOrder: 0 }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create failed");
      setNotice("Plan created ✅");
      setNewName("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  function setPackagePrice(durationMonths: number, priceCoins: number) {
    if (!draft) return;
    const next = [...(draft.packages ?? [])];
    const idx = next.findIndex((x) => x.durationMonths === durationMonths);
    if (idx >= 0) next[idx] = { ...next[idx], priceCoins };
    setDraft({ ...draft, packages: next });
  }

  function updatePriv(i: number, patch: Partial<Priv>) {
    if (!draft) return;
    const next = [...(draft.privileges ?? [])];
    next[i] = { ...next[i], ...patch };
    setDraft({ ...draft, privileges: next });
  }

  function addPriv() {
    if (!draft) return;
    setDraft({
      ...draft,
      privileges: [
        ...(draft.privileges ?? []),
        { key: "new_key", label: "New Privilege", value: "", locked: false, icon: null },
      ],
    });
  }

  function removePriv(i: number) {
    if (!draft) return;
    const next = [...(draft.privileges ?? [])];
    next.splice(i, 1);
    setDraft({ ...draft, privileges: next });
  }

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6 min-w-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-50">
              Guardian Plans
            </h1>
            <p className="text-[12px] text-slate-400 mt-1">
              Manage Guardian tiers, duration prices and privileges shown in the mobile Guardian screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill label={`Total: ${stats.total}`} />
            <Pill label={`Active: ${stats.active}`} />
            <button
              onClick={load}
              disabled={loading}
              className={cx(
                "rounded-xl px-3.5 py-2 text-[13px] font-medium border transition",
                "border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900",
                "w-full sm:w-auto",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
            {err}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">
            {notice}
          </div>
        )}

        {/* Create */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20 min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[14px] font-semibold text-slate-100">Create plan</h2>
            <span className="text-[11px] text-slate-400">Creates a new Guardian plan</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <Field label="Tier" className="lg:col-span-3">
              <select
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
              >
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
                <option value="DIAMOND">DIAMOND</option>
              </select>
            </Field>

            <Field label="Name" className="sm:col-span-2 lg:col-span-8">
              <input
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-400/60"
                placeholder="e.g. Guardian of Silver"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>

            <div className="sm:col-span-2 lg:col-span-1 flex lg:justify-end">
              <button
                onClick={createPlan}
                disabled={!newName.trim() || saving}
                className={cx(
                  "h-10 rounded-xl px-4 text-[13px] font-semibold transition",
                  "bg-yellow-400 text-black hover:bg-yellow-300",
                  "w-full lg:w-auto",
                  (!newName.trim() || saving) && "opacity-60 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 min-w-0">
          <div className="lg:col-span-4 min-w-0">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl shadow-black/20 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-slate-100">Plans</h2>
                <span className="text-[11px] text-slate-400">Select to edit</span>
              </div>

              <div className="mt-3 space-y-2">
                {plans.map((p) => {
                  const active = p.id === (selectedId ?? plans[0]?.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cx(
                        "w-full text-left rounded-2xl border px-3.5 py-3 transition min-w-0",
                        active
                          ? "border-yellow-400/40 bg-slate-950/40"
                          : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/35"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="text-[13px] font-semibold text-slate-100 truncate">
                          {p.name}
                        </div>
                        <span
                          className={cx(
                            "text-[11px] rounded-full px-2 py-0.5 border whitespace-nowrap shrink-0",
                            p.isActive
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-900/40 text-slate-400"
                          )}
                        >
                          {p.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-400 break-words">
                        Tier: {p.tier}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 min-w-0">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 shadow-xl shadow-black/20 min-w-0">
              {!draft ? (
                <div className="text-[13px] text-slate-400">Select a plan…</div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-400">Editing</div>
                      <div className="text-[18px] font-semibold text-slate-50 truncate">
                        {draft.name}
                      </div>
                      <div className="text-[12px] text-slate-400 mt-1">
                        Tier: <span className="text-slate-200">{draft.tier}</span>
                      </div>
                    </div>

                    <button
                      onClick={save}
                      disabled={!dirty || saving}
                      className={cx(
                        "h-10 rounded-xl px-4 text-[13px] font-semibold transition border",
                        "w-full md:w-auto",
                        dirty
                          ? "border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300"
                          : "border-slate-700 bg-slate-900/60 text-slate-400 cursor-not-allowed",
                        saving && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 md:items-end min-w-0">
                    <Field label="Name">
                      <input
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                    </Field>

                    <Field label="Sort Order">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                        value={draft.sortOrder}
                        onChange={(e) =>
                          setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })
                        }
                      />
                    </Field>

                    <Field label="Description" className="md:col-span-2">
                      <input
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                        value={draft.description ?? ""}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      />
                    </Field>

                    <div className="flex items-end">
                      <Toggle
                        label="Active"
                        value={draft.isActive}
                        onChange={(v) => setDraft({ ...draft, isActive: v })}
                      />
                    </div>
                  </div>

                  {/* Package prices */}
                  <div className="mt-6">
                    <div className="text-[14px] font-semibold text-slate-100">Duration Prices (Coins)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      These power the “Coins needed” on mobile when user selects duration.
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[1, 3, 6, 12].map((m) => {
                        const pkg = (draft.packages ?? []).find((x) => x.durationMonths === m);
                        return (
                          <Field key={m} label={`${m} Month${m > 1 ? "s" : ""}`}>
                            <input
                              type="number"
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                              value={pkg?.priceCoins ?? 0}
                              onChange={(e) => setPackagePrice(m, Number(e.target.value) || 0)}
                            />
                          </Field>
                        );
                      })}
                    </div>
                  </div>

                  {/* Privileges */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-slate-100">Privileges</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        These show in the mobile Guardian screen.
                      </div>
                    </div>

                    <button
                      onClick={addPriv}
                      className="h-10 rounded-xl px-3.5 text-[13px] font-medium border border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900 w-full sm:w-auto"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(draft.privileges ?? []).map((p, i) => (
                      <div
                        key={`${p.key}-${i}`}
                        className="rounded-2xl border border-slate-800 bg-slate-950/20 px-3 py-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Key">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                              value={p.key}
                              onChange={(e) => updatePriv(i, { key: e.target.value })}
                            />
                          </Field>
                          <Field label="Label">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                              value={p.label}
                              onChange={(e) => updatePriv(i, { label: e.target.value })}
                            />
                          </Field>

                          <Field label="Value" className="sm:col-span-2">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                              value={p.value ?? ""}
                              onChange={(e) => updatePriv(i, { value: e.target.value })}
                            />
                          </Field>

                          <Field label="Icon (Ionicons name)">
                            <input
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                              value={p.icon ?? ""}
                              onChange={(e) => updatePriv(i, { icon: e.target.value || null })}
                            />
                          </Field>

                          <div className="flex items-end justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">Locked</span>
                              <Switch
                                value={!!p.locked}
                                onChange={(v) => updatePriv(i, { locked: v })}
                              />
                            </div>

                            <button
                              onClick={() => removePriv(i)}
                              className="h-10 rounded-xl border border-slate-700 bg-slate-900/60 px-3 text-[13px] font-medium text-red-200 hover:bg-slate-900"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!draft.privileges || draft.privileges.length === 0) && (
                      <div className="text-[13px] text-slate-400">No privileges.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Mobile endpoint: <code className="text-slate-300">/api/profile/guardian?userId=...</code>
        </div>
      </div>
    </div>
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
    <div className={cx("min-w-0", className)}>
      <div className="text-[11px] font-medium text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[12px] text-slate-200 whitespace-nowrap">
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
        "h-10 w-full md:w-auto flex items-center gap-2 rounded-xl border px-3 text-[13px] transition",
        value
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-950/60"
      )}
      aria-pressed={value}
    >
      <span className={cx("h-2.5 w-2.5 rounded-full", value ? "bg-emerald-400" : "bg-slate-500")} />
      {label}
    </button>
  );
}

function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cx(
        "h-10 w-16 rounded-full border transition relative shrink-0",
        value ? "border-emerald-500/40 bg-emerald-500/20" : "border-slate-700 bg-slate-950/40"
      )}
      aria-pressed={value}
    >
      <span
        className={cx(
          "absolute top-1/2 -translate-y-1/2 h-7 w-7 rounded-full transition",
          value ? "left-8 bg-emerald-400" : "left-1 bg-slate-400"
        )}
      />
    </button>
  );
}
