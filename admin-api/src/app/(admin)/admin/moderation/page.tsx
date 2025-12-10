// src/app/(admin)/moderation/page.tsx
export const dynamic = "force-dynamic";

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Moderation</h1>
        <p className="mt-1 text-xs text-slate-400">
          Overview of reports, bans and safety tools. We&apos;ll hook this into
          reports once the schema is ready.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending reports" value={0} hint="Waiting for review" />
        <StatCard label="Active bans" value={0} hint="Currently blocked" />
        <StatCard label="Muted users" value={0} hint="Temporary mutes" />
      </section>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-xs text-slate-300">
        <p className="mb-2">
          Once we add a <code>Report</code> model, this page can show:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>List of latest reports with filters (spam, abuse, etc.)</li>
          <li>Quick actions (warn, mute, ban, disable stream)</li>
          <li>History of actions for each user / host</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      {hint && (
        <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>
      )}
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
