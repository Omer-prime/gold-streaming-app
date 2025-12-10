import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStreamsPage() {
  const streams = await prisma.stream.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      host: {
        select: { id: true, username: true, nickname: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Streams</h1>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <Th>Title</Th>
              <Th>Host</Th>
              <Th>Live?</Th>
              <Th>Viewers</Th>
              <Th>Started</Th>
            </tr>
          </thead>
          <tbody>
            {streams.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <Td>{s.title}</Td>
                <Td>
                  {s.host.nickname ?? s.host.username}{" "}
                  <span className="text-slate-500 text-[10px]">
                    @{s.host.username}
                  </span>
                </Td>
                <Td>
                  {s.isLive ? (
                    <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Ended</span>
                  )}
                </Td>
                <Td>{s.viewers}</Td>
                <Td>{s.startedAt ? s.startedAt.toISOString().slice(0, 16).replace("T", " ") : "-"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-2 whitespace-nowrap text-slate-100 text-xs">
      {children}
    </td>
  );
}
