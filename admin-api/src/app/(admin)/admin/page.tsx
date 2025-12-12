// src/app/(admin)/admin/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const today = startOfToday();
  const monthStart = startOfMonth();

  const [
    totalUsers,
    totalHosts,
    totalStreams,
    liveStreams,
    totalGifts,
    totalCoinsAgg,
    coinsTodayAgg,
    coinsMonthAgg,
    newUsersToday,
    activeLiveRooms,
    topHostEarnings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.stream.count(),
    prisma.stream.count({ where: { isLive: true } }),
    prisma.gift.count(),
    prisma.giftTransaction.aggregate({
      _sum: { totalPrice: true },
    }),
    prisma.giftTransaction.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.giftTransaction.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.stream.findMany({
      where: { isLive: true },
      orderBy: { viewers: "desc" },
      take: 5,
      include: { host: true },
    }),
    // top earning hosts (by coins received all time)
    prisma.giftTransaction.groupBy({
      by: ["receiverId"],
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),
  ]);

  const totalCoins = totalCoinsAgg._sum.totalPrice ?? 0;
  const coinsToday = coinsTodayAgg._sum.totalPrice ?? 0;
  const coinsThisMonth = coinsMonthAgg._sum.totalPrice ?? 0;

  // load host user details for top earnings
  const topHostIds = topHostEarnings.map((h) => h.receiverId);
  const topHostUsers =
    topHostIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: topHostIds } },
          select: { id: true, username: true, nickname: true },
        })
      : [];

  const topHosts = topHostEarnings.map((h) => {
    const user = topHostUsers.find((u) => u.id === h.receiverId);
    return {
      id: h.receiverId,
      username: user?.username ?? "Unknown",
      nickname: user?.nickname ?? null,
      coins: h._sum.totalPrice ?? 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live snapshot of Gold Live platform activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
            👥 Total users:{" "}
            <span className="font-semibold text-slate-50">{totalUsers}</span>
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
            🎤 Hosts:{" "}
            <span className="font-semibold text-slate-50">{totalHosts}</span>
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
            📺 Live now:{" "}
            <span className="font-semibold text-emerald-400">
              {liveStreams}
            </span>
          </span>
        </div>
      </header>

      {/* Top stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          icon="👥"
          hint="All registered accounts"
          value={totalUsers}
          href="/admin/users"
        />
        <StatCard
          label="Active Live Rooms"
          icon="📺"
          hint="Currently live streams"
          value={`${liveStreams} / ${totalStreams}`}
          href="/admin/streams"
        />
        <StatCard
          label="Revenue Today"
          icon="💰"
          hint="Coins spent today"
          value={`${coinsToday} coins`}
          href="/admin/gifts"
        />
        <StatCard
          label="Active Hosts"
          icon="🎤"
          hint="Users with HOST role"
          value={totalHosts}
          href="/admin/hosts"
        />
        <StatCard
          label="New Users Today"
          icon="✨"
          hint="Joined since midnight"
          value={newUsersToday}
          href="/admin/users"
        />
        <StatCard
          label="Platform Earnings (Month)"
          icon="📈"
          hint="Coins spent this month"
          value={`${coinsThisMonth} coins`}
          href="/admin/gifts"
        />
        <StatCard
          label="Gifts Catalog"
          icon="🎁"
          hint="Total active gift types"
          value={totalGifts}
          href="/admin/gifts"
        />
        <StatCard
          label="Total Revenue (All time)"
          icon="🏦"
          hint="All time coins"
          value={`${totalCoins} coins`}
          href="/admin/gifts"
        />
      </section>

      {/* lower panels: active rooms + top hosts */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Active Live Rooms */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Active Live Rooms</h2>
              <p className="text-[11px] text-slate-400">
                Top live rooms by current viewers.
              </p>
            </div>
            <Link
              href="/admin/streams"
              className="text-[11px] font-medium text-slate-400 hover:text-yellow-300"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="p-4">
            {activeLiveRooms.length === 0 ? (
              <p className="text-xs text-slate-500">
                No active live rooms right now.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-xs">
                  <thead className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <Th>Title</Th>
                      <Th>Host</Th>
                      <Th>Viewers</Th>
                      <Th>Started</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLiveRooms.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-900/80 hover:bg-slate-900/60"
                      >
                        <Td>{s.title}</Td>
                        <Td>{s.host?.username ?? "-"}</Td>
                        <Td>{s.viewers}</Td>
                        <Td>
                          {s.startedAt
                            ? s.startedAt.toISOString().slice(11, 16)
                            : "-"}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Online Hosts / earnings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Top Hosts (by coins)</h2>
              <p className="text-[11px] text-slate-400">
                All-time earnings ranking.
              </p>
            </div>
            <Link
              href="/admin/hosts"
              className="text-[11px] font-medium text-slate-400 hover:text-yellow-300"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="p-4">
            {topHosts.length === 0 ? (
              <p className="text-xs text-slate-500">
                No gift transactions yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-xs">
                  <thead className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <Th>Host</Th>
                      <Th>Nickname</Th>
                      <Th className="text-right">Coins</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHosts.map((h) => (
                      <tr
                        key={h.id}
                        className="border-b border-slate-900/80 hover:bg-slate-900/60"
                      >
                        <Td>{h.username}</Td>
                        <Td>{h.nickname ?? "-"}</Td>
                        <Td className="text-right">{h.coins}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: string;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-sm">
              {icon}
            </span>
          )}
          <div>
            <div className="text-xs font-medium text-slate-300">{label}</div>
            {hint && (
              <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>
            )}
          </div>
        </div>
        {href && (
          <span className="text-[11px] text-slate-500 group-hover:text-yellow-300">
            Open &rarr;
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-50">
        {value}
      </div>
    </div>
  );

  const baseClasses =
    "rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={
          baseClasses +
          " group hover:border-yellow-400/60 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60"
        }
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        "px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide " +
        className
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={"px-2 py-2 text-slate-100 align-middle " + className}>
      {children}
    </td>
  );
}
