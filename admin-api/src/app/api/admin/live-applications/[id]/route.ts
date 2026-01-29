import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LiveApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

// In Next 15 `params` is a Promise in some cases – unwrap it safely
type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function getIdFromContext(ctx: RouteContext): Promise<string | null> {
  const paramsAny: any = ctx.params;
  const resolved =
    paramsAny && typeof paramsAny.then === "function" ? await paramsAny : paramsAny;

  return resolved?.id ?? null;
}

// PATCH /api/admin/live-applications/[id]
// Body: { status: "APPROVED" | "REJECTED" | "PENDING" }
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const id = await getIdFromContext(ctx);

    if (!id) {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const status = body?.status as LiveApplicationStatus | undefined;

    if (status !== "APPROVED" && status !== "REJECTED" && status !== "PENDING") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.liveApplication.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update application status
    const application = await prisma.liveApplication.update({
      where: { id },
      data: { status },
      include: {
        user: { include: { country: true } },
      },
    });

    // ✅ Sync faceVerifiedAt ONLY when APPROVED
    // - APPROVED => set faceVerifiedAt = now
    // - REJECTED => clear faceVerifiedAt
    // - PENDING  => do nothing
    try {
      if (status === "APPROVED") {
        await prisma.user.update({
          where: { id: application.userId },
          data: { faceVerifiedAt: new Date() },
        });
      } else if (status === "REJECTED") {
        await prisma.user.update({
          where: { id: application.userId },
          data: { faceVerifiedAt: null },
        });
      }
    } catch (err) {
      console.error("faceVerifiedAt sync error:", err);
      // don't fail PATCH if sync fails
    }

    // 🔔 Create notification for APPROVED / REJECTED
    try {
      if (status === "APPROVED") {
        await prisma.notification.create({
          data: {
            userId: application.userId,
            type: "LIVE_APPLICATION_APPROVED",
            title: "Real-person verification approved",
            body: "Congratulations! Your real-person verification has been approved. You can now start hosting live rooms.",
          },
        });
      } else if (status === "REJECTED") {
        await prisma.notification.create({
          data: {
            userId: application.userId,
            type: "LIVE_APPLICATION_REJECTED",
            title: "Real-person verification rejected",
            body: "Unfortunately your real-person verification was rejected. Please check your selfie and try again.",
          },
        });
      }
    } catch (err) {
      console.error("Notification create error:", err);
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error("Update live application error:", error);
    return NextResponse.json({ error: "Failed to update live application" }, { status: 500 });
  }
}

// DELETE /api/admin/live-applications/[id]
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const id = await getIdFromContext(ctx);

    if (!id) {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    const existing = await prisma.liveApplication.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.liveApplication.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete live application error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
