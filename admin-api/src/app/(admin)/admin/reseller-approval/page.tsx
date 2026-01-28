import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function setResellerStatus(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  const note = String(formData.get("note") || "");

  await prisma.resellerApplication.update({
    where: { userId },
    data: { status: status as any, note: note || null, reviewedAt: new Date() },
  });

  // optional: if approved, set role, or add another field
  if (status === "APPROVED") {
    // If you want reseller to be HOST or special role - you can change here
    // await prisma.user.update({ where: { id: userId }, data: { role: "HOST" } });
  }

  revalidatePath("/admin/reseller-approval");
}

export default async function ResellerApprovalPage() {
  const items = await prisma.resellerApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reseller Approval</h1>
        <p className="text-sm text-slate-400">Approve / reject reseller applications.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
        <table className="w-full min-w-[900px] text-xs">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={4}>
                  No reseller applications yet.
                </td>
              </tr>
            ) : (
              items.map((a) => (
                <tr key={a.id} className="border-b border-slate-900/70">
                  <td className="px-3 py-2">
                    <div className="font-medium">{a.user.username}</div>
                    <div className="text-slate-500">{a.user.email ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full border border-slate-700 px-2 py-0.5">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{a.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <form action={setResellerStatus} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={a.userId} />
                      <input
                        name="note"
                        placeholder="note (optional)"
                        className="w-56 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-slate-100"
                      />
                      <button name="status" value="APPROVED" className="rounded-lg bg-emerald-600/80 px-2 py-1 text-white">
                        Approve
                      </button>
                      <button name="status" value="REJECTED" className="rounded-lg bg-red-600/80 px-2 py-1 text-white">
                        Reject
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
