"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type VipTierApi = "NONE" | "NORMAL" | "SUPER" | "DIAMOND" | "SVIP";

type VipPrivilege = {
  key: string;
  label: string;
  value?: string;
  locked?: boolean;
};

type VipPlan = {
  id: string;
  tier: VipTierApi;
  name: string;
  description?: string;
  monthlyPriceCoins: number;
  privileges: VipPrivilege[];
  isActive: boolean;
  sortOrder: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizePlan(p: any): VipPlan {
  // supports both:
  // 1) already-ui-shaped: { monthlyPriceCoins, privileges }
  // 2) prisma-shaped: { packages, planPrivileges }
  if (typeof p?.monthlyPriceCoins === "number" && Array.isArray(p?.privileges)) {
    return {
      id: String(p.id),
      tier: p.tier,
      name: String(p.name ?? ""),
      description: p.description ?? "",
      monthlyPriceCoins: Number(p.monthlyPriceCoins ?? 0) || 0,
      privileges: p.privileges.map((x: any) => ({
        key: String(x.key ?? ""),
        label: String(x.label ?? ""),
        value: x.value ?? "",
        locked: Boolean(x.locked ?? false),
      })),
      isActive: Boolean(p.isActive),
      sortOrder: Number(p.sortOrder ?? 0) || 0,
    };
  }

  const packages = Array.isArray(p?.packages) ? p.packages : [];
  const monthly =
    packages.find((x: any) => x.durationMonths === 1) ??
    [...packages].sort(
      (a: any, b: any) => (a.durationMonths ?? 99) - (b.durationMonths ?? 99)
    )[0];

  const monthlyPriceCoins = Number(monthly?.priceCoins ?? 0) || 0;

  const links = Array.isArray(p?.planPrivileges) ? p.planPrivileges : [];
  const privileges = links.map((l: any) => ({
    key: String(l?.privilege?.key ?? ""),
    label: String(l?.privilege?.label ?? ""),
    value: l?.valueOverride ?? l?.privilege?.defaultValue ?? "",
    locked: Boolean(l?.locked ?? false),
  }));

  return {
    id: String(p.id),
    tier: p.tier,
    name: String(p.name ?? ""),
    description: p.description ?? "",
    monthlyPriceCoins,
    privileges,
    isActive: Boolean(p.isActive),
    sortOrder: Number(p.sortOrder ?? 0) || 0,
  };
}

export default function AdminVipPage() {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? plans[0] ?? null,
    [plans, selectedId]
  );

  const [draft, setDraft] = useState<VipPlan | null>(null);

  // create plan form
  const [newTier, setNewTier] = useState<Exclude<VipTierApi, "NONE">>("NORMAL");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);

  const editorRef = useRef<HTMLDivElement | null>(null);

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
      const res = await fetch("/api/admin/vip/plans", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load VIP plans");

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
      const res = await fetch(`/api/admin/vip/plans/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description ?? "",
          sortOrder: draft.sortOrder,
          isActive: draft.isActive,
          monthlyPriceCoins: draft.monthlyPriceCoins,
          privileges: draft.privileges ?? [],
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Save failed");

      setNotice("VIP plan saved ✅");
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
      const res = await fetch("/api/admin/vip/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: newTier,
          name,
          monthlyPriceCoins: Number(newPrice || 0),
          isActive: true,
          sortOrder: 0,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create failed");
      setNotice("Plan created ✅");
      setNewName("");
      setNewPrice(0);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  function updatePriv(i: number, patch: Partial<VipPrivilege>) {
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
        { key: "new_key", label: "New Privilege", value: "", locked: false },
      ],
    });
  }

  function removePriv(i: number) {
    if (!draft) return;
    const next = [...(draft.privileges ?? [])];
    next.splice(i, 1);
    setDraft({ ...draft, privileges: next });
  }

  function selectPlan(id: string) {
    setSelectedId(id);

    // Mobile UX: after selecting, jump to editor so user doesn’t scroll forever
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="w-full  space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-50">
              VIP Plans
            </h1>
            <p className="text-[12px] text-slate-400 mt-1">
              Manage VIP tiers, monthly price and privileges shown in the mobile VIP Center.
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

        {/* Alerts */}
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
            <span className="text-[11px] text-slate-400">Creates a new VIP tier plan</span>
          </div>

          {/* Mobile-friendly grid:
              - base: stacked
              - sm: 2 columns
              - lg: original 12-col alignment */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <Field label="Tier" className="lg:col-span-3">
              <select
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
              >
                <option value="NORMAL">NORMAL</option>
                <option value="SUPER">SUPER</option>
                <option value="DIAMOND">DIAMOND</option>
                <option value="SVIP">SVIP</option>
              </select>
            </Field>

            <Field label="Name" className="sm:col-span-2 lg:col-span-5">
              <input
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-400/60"
                placeholder="e.g. VIP Normal"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>

            <Field label="Monthly price (coins)" className="lg:col-span-3">
              <input
                type="number"
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value) || 0)}
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

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-12 min-w-0">
          {/* Left list */}
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
                      onClick={() => selectPlan(p.id)}
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
                        Tier: {p.tier} • {Number(p.monthlyPriceCoins || 0).toLocaleString()} / M
                      </div>
                    </button>
                  );
                })}

                {!loading && plans.length === 0 && (
                  <div className="text-[13px] text-slate-400">No plans yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right editor */}
          <div className="lg:col-span-8 min-w-0" ref={editorRef}>
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

                    <Field label="Monthly Price (Coins)">
                      <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                        value={draft.monthlyPriceCoins}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            monthlyPriceCoins: Number(e.target.value) || 0,
                          })
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

                    <div className="flex items-end">
                      <Toggle
                        label="Active"
                        value={draft.isActive}
                        onChange={(v) => setDraft({ ...draft, isActive: v })}
                      />
                    </div>
                  </div>

                  {/* Privileges */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-slate-100">
                        Privileges
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        These show in the mobile VIP Center screen.
                      </div>
                    </div>

                    <button
                      onClick={addPriv}
                      className="h-10 rounded-xl px-3.5 text-[13px] font-medium border border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-900 w-full sm:w-auto"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Responsive privileges layout:
                      - No forced 820px width on mobile
                      - Header row only on md+ */}
                  <div className="mt-3 min-w-0">
                    <div className="overflow-x-auto">
                      <div className="min-w-0 md:min-w-[820px]">
                        <div className="hidden md:grid grid-cols-[1fr_1.2fr_1fr_auto_auto] gap-3 px-3 pb-2 text-[11px] font-medium text-slate-400">
                          <div>Key</div>
                          <div>Label</div>
                          <div>Value</div>
                          <div className="text-center">Locked</div>
                          <div className="text-right">Action</div>
                        </div>

                        <div className="space-y-2">
                          {(draft.privileges ?? []).map((p, i) => (
                            <div
                              key={`${p.key}-${i}`}
                              className="rounded-2xl border border-slate-800 bg-slate-950/20 px-3 py-3"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_1.2fr_1fr_auto_auto] gap-3 md:items-center min-w-0">
                                <div className="sm:col-span-2 md:col-span-1 min-w-0">
                                  <div className="md:hidden text-[11px] font-medium text-slate-400 mb-1">
                                    Key
                                  </div>
                                  <input
                                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                                    value={p.key}
                                    onChange={(e) => updatePriv(i, { key: e.target.value })}
                                  />
                                </div>

                                <div className="sm:col-span-2 md:col-span-1 min-w-0">
                                  <div className="md:hidden text-[11px] font-medium text-slate-400 mb-1">
                                    Label
                                  </div>
                                  <input
                                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                                    value={p.label}
                                    onChange={(e) =>
                                      updatePriv(i, { label: e.target.value })
                                    }
                                  />
                                </div>

                                <div className="sm:col-span-2 md:col-span-1 min-w-0">
                                  <div className="md:hidden text-[11px] font-medium text-slate-400 mb-1">
                                    Value
                                  </div>
                                  <input
                                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[13px] text-slate-100 outline-none focus:border-yellow-400/60"
                                    value={p.value ?? ""}
                                    onChange={(e) =>
                                      updatePriv(i, { value: e.target.value })
                                    }
                                  />
                                </div>

                                <div className="flex sm:justify-start md:justify-center">
                                  <div className="md:hidden text-[11px] font-medium text-slate-400 mb-1 sm:hidden">
                                    Locked
                                  </div>
                                  <Switch
                                    value={!!p.locked}
                                    onChange={(v) => updatePriv(i, { locked: v })}
                                  />
                                </div>

                                <div className="flex sm:justify-end md:justify-end">
                                  <button
                                    onClick={() => removePriv(i)}
                                    className="h-10 w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900/60 px-3 text-[13px] font-medium text-red-200 hover:bg-slate-900"
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
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Mobile endpoint used by app:{" "}
          <code className="text-slate-300">/api/profile/vip?userId=...</code>
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
