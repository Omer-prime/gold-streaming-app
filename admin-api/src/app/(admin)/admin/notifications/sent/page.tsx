// admin-api/src/app/(admin)/admin/notifications/sent/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default async function SentNotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = clamp(Number(searchParams.page ?? "1") || 1, 1, 999999);
  const pageSize = 15;
  const skip = (page - 1) * pageSize;
  const q = (searchParams.q ?? "").trim();

  const where: Prisma.AdminNotificationWhereInput =
    q.length > 0
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              body: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

  const [total, campaigns] = await Promise.all([
    prisma.adminNotification.count({ where }),
    prisma.adminNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
      },
    }),
  ]);

  // ✅ Count how many user-notification rows were created per campaign
  const ids = campaigns.map((c) => c.id);

  const counts =
    ids.length > 0
      ? await prisma.notification.groupBy({
          by: ["adminNotificationId"],
          where: { adminNotificationId: { in: ids } },
          _count: { _all: true },
        })
      : [];

  const sentMap = new Map<string, number>();
  for (const c of counts) {
    if (c.adminNotificationId) {
      sentMap.set(c.adminNotificationId, c._count._all);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sent notifications</h1>
          <p className="text-xs text-slate-400">
            History of campaigns you sent from admin.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/notifications"
            className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-100 hover:bg-slate-900"
          >
            + Create notification
          </Link>
        </div>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title/body…"
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
        />
        <button className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">
                Body
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wide">
                Sent to
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wide">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="text-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={4}>
                  No campaigns yet.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/60">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.body.length > 90 ? c.body.slice(0, 90) + "…" : c.body}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sentMap.get(c.id) ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Page <span className="text-slate-100">{page}</span> /{" "}
          <span className="text-slate-100">{totalPages}</span> — Total{" "}
          <span className="text-slate-100">{total}</span>
        </div>

        <div className="flex gap-2">
          {prev ? (
            <Link
              className="rounded-lg border border-slate-800 px-3 py-2 hover:bg-slate-900"
              href={`/admin/notifications/sent?page=${prev}&q=${encodeURIComponent(
                q
              )}`}
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-900 px-3 py-2 opacity-50">
              ← Prev
            </span>
          )}

          {next ? (
            <Link
              className="rounded-lg border border-slate-800 px-3 py-2 hover:bg-slate-900"
              href={`/admin/notifications/sent?page=${next}&q=${encodeURIComponent(
                q
              )}`}
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-900 px-3 py-2 opacity-50">
              Next →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
