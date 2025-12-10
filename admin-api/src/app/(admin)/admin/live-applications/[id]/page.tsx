// admin-api/src/app/(admin)/admin/live-applications/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLiveApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Missing live application id
        </div>
        <Link
          href="/admin/live-applications"
          className="mt-4 inline-block text-xs text-slate-300 underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const application = await prisma.liveApplication.findUnique({
    where: { id },
    include: {
      user: {
        include: { country: true },
      },
    },
  });

  if (!application) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Live application not found.
        </div>
        <Link
          href="/admin/live-applications"
          className="mt-4 inline-block text-xs text-slate-300 underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const { user } = application;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Live application detail
          </h1>
          <p className="text-sm text-slate-400">
            Review user information and face scan.
          </p>
        </div>
        <Link
          href="/admin/live-applications"
          className="text-xs text-slate-300 underline"
        >
          ← Back to list
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[200px,1fr]">
        {/* Face image */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center">
          {application.faceImageBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${application.faceImageBase64}`}
              alt="Face scan"
              className="h-48 w-48 rounded-2xl object-cover bg-slate-800"
            />
          ) : (
            <div className="h-48 w-48 rounded-2xl bg-slate-800 flex items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* User + meta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm">
          <div>
            <div className="font-semibold text-slate-100">
              {user.nickname || user.username}
            </div>
            <div className="text-xs text-slate-400">@{user.username}</div>
          </div>

          {user.email && (
            <div className="text-xs text-slate-300">Email: {user.email}</div>
          )}
          {user.phoneNumber && (
            <div className="text-xs text-slate-300">
              Phone: {user.phoneNumber}
            </div>
          )}

          <div className="text-xs text-slate-300">
            Status:{" "}
            <span className="font-semibold">{application.status}</span>
          </div>

          <div className="text-xs text-slate-400">
            Applied at:{" "}
            {new Date(application.createdAt)
              .toISOString()
              .slice(0, 16)
              .replace("T", " ")}
          </div>

          {user.country && (
            <div className="text-xs text-slate-300">
              Country: {user.country.flagEmoji} {user.country.name} (
              {user.country.code})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
