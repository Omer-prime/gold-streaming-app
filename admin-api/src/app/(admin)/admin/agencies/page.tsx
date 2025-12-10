// src/app/(admin)/agencies/page.tsx
export const dynamic = "force-dynamic";

export default function AgenciesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Agencies</h1>
      <p className="text-xs text-slate-400">
        Manage host agencies, revenue share and onboarding here.{" "}
        <span className="text-yellow-400">Coming later in the build.</span>
      </p>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-xs text-slate-300">
        No agency data yet. Once we add an Agency model to the backend, this
        page will let you:
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Create and edit agencies</li>
          <li>Assign hosts to agencies</li>
          <li>View agency earnings and payout summaries</li>
        </ul>
      </div>
    </div>
  );
}
