// src/app/(admin)/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

export type AdminUserRow = {
  id: string; // 👈 string, matches Prisma
  username: string;
  email: string | null;
  nickname: string | null;
  role: string;
  passwordHash: string | null;
  country: { code: string; flagEmoji: string | null } | null;
  wallet: { balance: number } | null;
  createdAt: string; // ISO string for client
};

export default async function AdminUsersPage() {
  const usersRaw = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      country: true,
      wallet: true,
    },
  });

  const users: AdminUserRow[] = usersRaw.map((u) => ({
    id: u.id, // 👈 no conversion, it's already string
    username: u.username,
    email: u.email,
    nickname: u.nickname,
    role: u.role,
    passwordHash: u.passwordHash,
    country: u.country
      ? { code: u.country.code, flagEmoji: u.country.flagEmoji }
      : null,
    wallet: u.wallet ? { balance: u.wallet.balance } : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-slate-400">
          Overview of all registered users and their balances.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
