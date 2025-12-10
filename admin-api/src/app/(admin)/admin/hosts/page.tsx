// src/app/(admin)/hosts/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHostsPage() {
  const hosts = await prisma.user.findMany({
    where: { role: "HOST" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { country: true, wallet: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hosts</h1>
      <p className="text-xs text-slate-400">
        All users with HOST role. Later we can add verification, bans and
        agency links.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900">
            <tr>
              <Th>Username</Th>
              <Th>Nickname</Th>
              <Th>Country</Th>
              <Th>Coins</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((h) => (
              <tr key={h.id} className="border-t border-slate-800">
                <Td>{h.username}</Td>
                <Td>{h.nickname ?? "-"}</Td>
                <Td>{h.country?.code ?? "-"}</Td>
                <Td>{h.wallet?.balance ?? 0}</Td>
                <Td>{h.createdAt.toISOString().slice(0, 10)}</Td>
              </tr>
            ))}

            {hosts.length === 0 && (
              <tr>
                <Td colSpan={5} className="text-center text-slate-500 py-6">
                  No hosts yet.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function Td({
  children,
  colSpan,
  className = "",
}: {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={"px-3 py-2 whitespace-nowrap text-slate-100 " + className}
    >
      {children}
    </td>
  );
}
