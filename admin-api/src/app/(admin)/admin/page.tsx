// src/app/(admin)/admin/page.tsx
import { prisma } from "@/lib/prisma";

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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            High level overview of Gold Live activity.
          </p>
        </div>
      </header>

      {/* Top stats grid (like Poppo) */}
      <section className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
        <StatCard label="Total Users" hint="All registered users" value={totalUsers} />
        <StatCard
          label="Active Live Rooms"
          hint="Currently live"
          value={liveStreams}
        />
        <StatCard
          label="Revenue Today"
          hint="Coins spent today"
          value={`${coinsToday} coins`}
        />
        <StatCard
          label="Active Hosts"
          hint="Hosts with HOST role"
          value={totalHosts}
        />
        <StatCard
          label="New Users Today"
          hint="Joined since midnight"
          value={newUsersToday}
        />
        <StatCard
          label="Platform Earnings"
          hint="Coins this month"
          value={`${coinsThisMonth} coins`}
        />
        <StatCard
          label="Pending Reports"
          hint="Moderation queue"
          value={0} // TODO: wire once reports model exists
        />
        <StatCard
          label="Total Revenue"
          hint="All time coins"
          value={`${totalCoins} coins`}
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
                Top live rooms by viewers
              </p>
            </div>
          </div>
          <div className="p-4">
            {activeLiveRooms.length === 0 ? (
              <p className="text-xs text-slate-500">
                No active live rooms right now.
              </p>
            ) : (
              <table className="w-full text-xs">
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
                    <tr key={s.id} className="border-b border-slate-900/80">
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
            )}
          </div>
        </div>

        {/* Top Online Hosts / earnings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Top Hosts</h2>
              <p className="text-[11px] text-slate-400">
                By total coins received (all time)
              </p>
            </div>
          </div>
          <div className="p-4">
            {topHosts.length === 0 ? (
              <p className="text-xs text-slate-500">
                No gift transactions yet.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <Th>Host</Th>
                    <Th>Nickname</Th>
                    <Th className="text-right">Coins</Th>
                  </tr>
                </thead>
                <tbody>
                  {topHosts.map((h) => (
                    <tr key={h.id} className="border-b border-slate-900/80">
                      <Td>{h.username}</Td>
                      <Td>{h.nickname ?? "-"}</Td>
                      <Td className="text-right">{h.coins}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">{label}</div>
          {hint && (
            <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>
          )}
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
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
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={"px-2 py-2 text-slate-100 " + className}>{children}</td>;
}
