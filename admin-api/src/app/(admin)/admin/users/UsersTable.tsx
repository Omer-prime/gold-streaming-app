"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import type { AdminUserRow } from "./page";

type Props = {
  initialUsers: AdminUserRow[];
};

const UsersTable: React.FC<Props> = ({ initialUsers }) => {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const ok = window.confirm(
      `Delete user "${user.username}"? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Delete failed", await res.text());
        alert("Failed to delete user.");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
      alert("Network error while deleting user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Nickname</Th>
            <Th>Role</Th>
            <Th>Auth</Th>
            <Th>Country</Th>
            <Th>Coins</Th>
            <Th>Joined</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const authLabel = u.passwordHash ? "Password" : "-";

            return (
              <tr key={u.id} className="border-t border-slate-800">
                <Td>
                  <span className="font-medium text-slate-50">
                    {u.username}
                  </span>
                </Td>
                <Td className="text-slate-300">
                  {u.email ?? <span className="text-slate-500">-</span>}
                </Td>
                <Td>{u.nickname ?? "-"}</Td>
                <Td>
                  <span className="text-[11px] rounded-full bg-slate-800/70 px-2 py-0.5 uppercase tracking-wide">
                    {u.role}
                  </span>
                </Td>
                <Td>{authLabel}</Td>
                <Td>
                  {u.country
                    ? `${u.country.flagEmoji ?? ""} ${u.country.code}`
                    : "-"}
                </Td>
                <Td>{u.wallet?.balance ?? 0}</Td>
                <Td>{u.createdAt.slice(0, 10)}</Td>
                <Td className="text-right">
                  {u.role === "ADMIN" ? (
                    <span className="text-[11px] text-slate-500">
                      Protected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      className="inline-flex items-center rounded-full border border-red-500/60 px-3 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {deletingId === u.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <Td colSpan={9} className="text-center text-slate-400 py-6">
                No users found.
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 " +
        (className ?? "")
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={
        "px-3 py-2 whitespace-nowrap text-slate-100 text-xs align-middle " +
        (className ?? "")
      }
    >
      {children}
    </td>
  );
}

export default UsersTable;
