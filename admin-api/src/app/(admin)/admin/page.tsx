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
  const now = new Date();

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

    // ✅ NEW (admin features)
    currencyTradesPending,
    currencyTradesTotal,
    resellerAppsPending,
    resellerAppsTotal,
    baseSalaryPending,
    baseSalaryTotal,

    // ✅ NEW (small preview lists)
    latestPendingTrades,
    latestPendingResellers,
    latestPendingSalaries,

    // ✅ VIP (NEW)
    vipActiveUsers,
    vipPlansCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.stream.count(),
    prisma.stream.count({ where: { isLive: true } }),
    prisma.gift.count(),

    prisma.giftTransaction.aggregate({ _sum: { totalPrice: true } }),
    prisma.giftTransaction.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.giftTransaction.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),

    prisma.stream.findMany({
      where: { isLive: true },
      orderBy: { viewers: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        viewers: true,
        startedAt: true,
        host: { select: { id: true, username: true } },
      },
    }),

    prisma.giftTransaction.groupBy({
      by: ["receiverId"],
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),

    // ✅ NEW counts
    prisma.currencyTrade.count({ where: { status: "PENDING" } }),
    prisma.currencyTrade.count(),
    prisma.resellerApplication.count({ where: { status: "PENDING" } }),
    prisma.resellerApplication.count(),
    prisma.baseSalaryRequest.count({ where: { status: "PENDING" } }),
    prisma.baseSalaryRequest.count(),

    // ✅ NEW latest pending lists
    prisma.currencyTrade.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        fromCurrency: true,
        toCurrency: true,
        fromAmount: true,
        toAmount: true,
        user: { select: { id: true, username: true } },
      },
    }),
    prisma.resellerApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, username: true } },
      },
    }),
    prisma.baseSalaryRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        amount: true,
        currency: true,
        user: { select: { id: true, username: true } },
      },
    }),

    // ✅ VIP (NEW) counts
    prisma.user.count({ where: { vipExpiresAt: { gt: now }, vipTier: { not: "NONE" } } }),
    // if you didn't add VipPlan model yet, comment this line until you migrate
    prisma.vipPlan.count(),
  ]);

  const totalCoins = totalCoinsAgg._sum.totalPrice ?? 0;
  const coinsToday = coinsTodayAgg._sum.totalPrice ?? 0;
  const coinsThisMonth = coinsMonthAgg._sum.totalPrice ?? 0;

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
            <span className="font-semibold text-emerald-400">{liveStreams}</span>
          </span>
        </div>
      </header>

      {/* Top stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" icon="👥" hint="All registered accounts" value={totalUsers} href="/admin/users" />
        <StatCard label="Active Live Rooms" icon="📺" hint="Currently live streams" value={`${liveStreams} / ${totalStreams}`} href="/admin/streams" />
        <StatCard label="Revenue Today" icon="💰" hint="Coins spent today" value={`${coinsToday} coins`} href="/admin/gifts" />
        <StatCard label="Active Hosts" icon="🎤" hint="Users with HOST role" value={totalHosts} href="/admin/hosts" />
        <StatCard label="New Users Today" icon="✨" hint="Joined since midnight" value={newUsersToday} href="/admin/users" />
        <StatCard label="Platform Earnings (Month)" icon="📈" hint="Coins spent this month" value={`${coinsThisMonth} coins`} href="/admin/gifts" />
        <StatCard label="Gifts Catalog" icon="🎁" hint="Total gift types" value={totalGifts} href="/admin/gifts" />
        <StatCard label="Total Revenue (All time)" icon="🏦" hint="All time coins" value={`${totalCoins} coins`} href="/admin/gifts" />

        {/* ✅ VIP shortcut (NEW) */}
        <StatCard
          label="VIP (Active)"
          icon="👑"
          hint={`Active VIP users • Plans: ${vipPlansCount}`}
          value={vipActiveUsers}
          href="/admin/vip"
        />

        {/* ✅ Rewards shortcut */}
        <StatCard label="Rewards" icon="🏆" hint="Manage tasks & rewards shown in the app" value="Manage" href="/admin/rewards" />

        {/* ✅ admin features cards */}
        <StatCard
          label="Currency Trades (Pending)"
          icon="💱"
          hint={`Pending approvals • Total: ${currencyTradesTotal}`}
          value={currencyTradesPending}
          href="/admin/currency-trading"
        />
        <StatCard
          label="Reseller Apps (Pending)"
          icon="🧾"
          hint={`Pending approvals • Total: ${resellerAppsTotal}`}
          value={resellerAppsPending}
          href="/admin/reseller-approval"
        />
        <StatCard
          label="Base Salary (Pending)"
          icon="💵"
          hint={`Pending approvals • Total: ${baseSalaryTotal}`}
          value={baseSalaryPending}
          href="/admin/base-salary-approval"
        />
      </section>

      {/* ✅ VIP + Rewards widgets */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* VIP widget (NEW) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">VIP Plans</h2>
              <p className="text-[11px] text-slate-400">
                Control VIP tiers, prices, and privileges shown in the mobile app.
              </p>
            </div>
            <Link
              href="/admin/vip"
              className="text-[11px] font-medium text-slate-400 hover:text-yellow-300"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="p-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-200 font-medium">
                Mobile API endpoint
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                <code className="text-slate-200">/api/profile/vip?userId=...</code>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/admin/vip"
                  className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-yellow-400/60 hover:text-yellow-300"
                >
                  Open VIP Manager
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: after you update a plan, the mobile app will show changes after refresh.
            </p>
          </div>
        </div>

        {/* Rewards widget (your existing) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Rewards</h2>
              <p className="text-[11px] text-slate-400">
                Control what users see in the Reward screen (tasks, points, GO actions).
              </p>
            </div>
            <Link
              href="/admin/rewards"
              className="text-[11px] font-medium text-slate-400 hover:text-yellow-300"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="p-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-200 font-medium">
                Mobile API endpoint
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                <code className="text-slate-200">/api/profile/rewards?userId=...</code>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/admin/rewards"
                  className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-yellow-400/60 hover:text-yellow-300"
                >
                  Open Rewards Manager
                </Link>
                <Link
                  href="/api/profile/rewards?userId=__TEST__"
                  className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-yellow-400/60 hover:text-yellow-300"
                >
                  Preview JSON (test)
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: once the admin Rewards page is ready, you’ll be able to add / disable tasks without touching code.
            </p>
          </div>
        </div>
      </section>

      {/* Active Live Rooms */}
      <section className="grid gap-4 lg:grid-cols-2">
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

        {/* Pending Approvals Preview (your existing) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Pending Approvals</h2>
              <p className="text-[11px] text-slate-400">Quick view (latest 5 each)</p>
            </div>
            <div className="text-[11px] text-slate-500">Overview</div>
          </div>

          <div className="p-4 space-y-4">
            {/* Currency Trades */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                <div className="text-xs font-semibold text-slate-200">Currency Trades</div>
                <Link href="/admin/currency-trading" className="text-[11px] text-slate-400 hover:text-yellow-300">
                  Open &rarr;
                </Link>
              </div>
              <div className="p-3">
                {latestPendingTrades.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No pending trades.</p>
                ) : (
                  <div className="space-y-2">
                    {latestPendingTrades.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-200">{t.user?.username ?? "-"}</span>
                        <span className="text-slate-400">
                          {t.fromAmount} {t.fromCurrency} → {t.toAmount} {t.toCurrency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reseller */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                <div className="text-xs font-semibold text-slate-200">Reseller Applications</div>
                <Link href="/admin/reseller-approval" className="text-[11px] text-slate-400 hover:text-yellow-300">
                  Open &rarr;
                </Link>
              </div>
              <div className="p-3">
                {latestPendingResellers.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No pending applications.</p>
                ) : (
                  <div className="space-y-2">
                    {latestPendingResellers.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-200">{r.user?.username ?? "-"}</span>
                        <span className="text-slate-500">{r.createdAt.toISOString().slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Base Salary */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                <div className="text-xs font-semibold text-slate-200">Base Salary Requests</div>
                <Link href="/admin/base-salary-approval" className="text-[11px] text-slate-400 hover:text-yellow-300">
                  Open &rarr;
                </Link>
              </div>
              <div className="p-3">
                {latestPendingSalaries.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No pending requests.</p>
                ) : (
                  <div className="space-y-2">
                    {latestPendingSalaries.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-200">{s.user?.username ?? "-"}</span>
                        <span className="text-slate-400">{s.amount} {s.currency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hosts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Top Hosts (by coins)</h2>
              <p className="text-[11px] text-slate-400">All-time earnings ranking.</p>
            </div>
            <Link href="/admin/hosts" className="text-[11px] font-medium text-slate-400 hover:text-yellow-300">
              View all &rarr;
            </Link>
          </div>
          <div className="p-4">
            {topHosts.length === 0 ? (
              <p className="text-xs text-slate-500">No gift transactions yet.</p>
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
                      <tr key={h.id} className="border-b border-slate-900/80 hover:bg-slate-900/60">
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

        {/* (Optional space for future widgets) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold">Next</h2>
            <p className="text-[11px] text-slate-400">
              We can add VIP purchase monitoring here (transactions + ledger).
            </p>
          </div>
          <div className="p-4 text-xs text-slate-500">
            Coming soon…
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
            {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
          </div>
        </div>
        {href && <span className="text-[11px] text-slate-500 group-hover:text-yellow-300">Open &rarr;</span>}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-50">{value}</div>
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

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={"px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide " + className}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={"px-2 py-2 text-slate-100 align-middle " + className}>{children}</td>;
}
