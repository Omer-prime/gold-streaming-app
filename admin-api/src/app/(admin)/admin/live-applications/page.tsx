// src/app/(admin)/admin/live-applications/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LiveApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type AdminLiveApplication = {
  id: string;
  status: LiveApplicationStatus;
  createdAt: string;
  updatedAt: string;
  faceImageBase64: string | null;
  user: {
    id: string;
    username: string;
    nickname: string | null;
    email: string | null;
    role: string;
    phoneNumber: string | null;
    createdAt: string;
    country: {
      code: string;
      name: string;
      flagEmoji: string | null;
    } | null;
  } | null;
};

export default function AdminLiveApplicationsPage() {
  const router = useRouter();

  const [items, setItems] = useState<AdminLiveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | LiveApplicationStatus
  >("PENDING");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  const load = async (
    status: "ALL" | LiveApplicationStatus,
    page: number,
    pageSize: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status !== "ALL") {
        params.set("status", status);
      }
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(
        `/api/admin/live-applications?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || "Failed to load live applications");
        setItems([]);
        setTotal(0);
        setPendingTotal(0);
        return;
      }

      const json = (await res.json()) as {
        applications: AdminLiveApplication[];
        total: number;
        page: number;
        pageSize: number;
        pendingTotal: number;
      };

      setItems(json.applications ?? []);
      setTotal(json.total ?? 0);
      setPendingTotal(json.pendingTotal ?? 0);
    } catch (e) {
      console.error(e);
      setError("Network error while loading applications");
      setItems([]);
      setTotal(0);
      setPendingTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, pageSize]);

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (updatingId || deletingId) return;

    setUpdatingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/live-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Update status error", json);
        setError(json?.error || "Failed to update status");
        return;
      }

      const updatedApp = (json as any).application as AdminLiveApplication;

      setItems((prev) =>
        prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
      );

      // update pending counter if status changed from PENDING
      if (status === "APPROVED" || status === "REJECTED") {
        setPendingTotal((prev) =>
          prev > 0 && statusFilter !== "PENDING" ? prev : Math.max(0, prev - 1)
        );
      }
    } catch (e) {
      console.error(e);
      setError("Network error while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId || updatingId) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/live-applications/${id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Delete application error", json);
        setError(json?.error || "Failed to delete application");
        return;
      }

      setItems((prev) => prev.filter((a) => a.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));

      // if this was pending, also decrement pendingTotal
      setPendingTotal((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
      setError("Network error while deleting application");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1); // reset to first page
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-2 md:px-4 py-4 md:py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Live Applications
          </h1>
          <p className="text-sm text-slate-400">
            Review host applications, check face scan and approve or reject.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-full border border-slate-700 px-3 py-1">
            Pending:{" "}
            <span className="font-semibold text-amber-300">
              {pendingTotal}
            </span>
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Pending"
            active={statusFilter === "PENDING"}
            onClick={() => {
              setStatusFilter("PENDING");
              setPage(1);
            }}
          />
          <FilterChip
            label="Approved"
            active={statusFilter === "APPROVED"}
            onClick={() => {
              setStatusFilter("APPROVED");
              setPage(1);
            }}
          />
          <FilterChip
            label="Rejected"
            active={statusFilter === "REJECTED"}
            onClick={() => {
              setStatusFilter("REJECTED");
              setPage(1);
            }}
          />
          <FilterChip
            label="All"
            active={statusFilter === "ALL"}
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
          />
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Rows per page:</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span>
            {loading
              ? "Loading applications..."
              : `Total: ${total} application(s)`}
          </span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-900">
            <tr>
              <Th>Face</Th>
              <Th>User</Th>
              <Th>Status</Th>
              <Th>Country</Th>
              <Th>Applied At</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((app) => {
              const user = app.user;

              return (
                <tr
                  key={app.id}
                  onClick={() =>
                    router.push(`/admin/live-applications/${app.id}`)
                  }
                  className="cursor-pointer border-t border-slate-800 hover:bg-slate-900/60"
                >
                  {/* selfie */}
                  <Td>
                    {app.faceImageBase64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`data:image/jpeg;base64,${app.faceImageBase64}`}
                        alt="Face scan"
                        className="h-14 w-14 rounded-xl object-cover bg-slate-800"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                        No image
                      </div>
                    )}
                  </Td>

                  {/* user info */}
                  <Td>
                    {user ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">
                          {user.nickname || user.username}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          @{user.username}
                        </span>
                        {user.email && (
                          <span className="text-[11px] text-slate-500">
                            {user.email}
                          </span>
                        )}
                        {user.phoneNumber && (
                          <span className="text-[11px] text-slate-500">
                            {user.phoneNumber}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        User record missing
                      </span>
                    )}
                  </Td>

                  {/* status badge */}
                  <Td>
                    <StatusBadge status={app.status} />
                  </Td>

                  {/* country */}
                  <Td>
                    {user?.country ? (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">
                          {user.country.flagEmoji}
                        </span>
                        <span>{user.country.code}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </Td>

                  {/* createdAt */}
                  <Td>
                    {new Date(app.createdAt)
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </Td>

                  {/* actions */}
                  <Td>
                    <div className="flex flex-col md:flex-row gap-2">
                      {app.status === "PENDING" && (
                        <>
                          <button
                            disabled={!!updatingId || !!deletingId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(app.id, "APPROVED");
                            }}
                            className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {updatingId === app.id
                              ? "Updating..."
                              : "Approve"}
                          </button>
                          <button
                            disabled={!!updatingId || !!deletingId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(app.id, "REJECTED");
                            }}
                            className="rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-400 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Delete always available */}
                      <button
                        disabled={!!updatingId || !!deletingId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(app.id);
                        }}
                        className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-red-300 border border-red-500/50 hover:bg-red-500/10 disabled:opacity-60"
                      >
                        {deletingId === app.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
                  No applications found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span>
            Showing{" "}
            {items.length > 0
              ? `${(page - 1) * pageSize + 1}–${
                  (page - 1) * pageSize + items.length
                }`
              : "0"}{" "}
            of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= totalPages || loading}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs " +
        (active
          ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
          : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500")
      }
    >
      {label}
    </button>
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
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={
        "px-3 py-2 align-top whitespace-nowrap text-slate-100 " +
        (className ?? "")
      }
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: LiveApplicationStatus }) {
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
        Pending
      </span>
    );
  }
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-300">
      Rejected
    </span>
  );
}
