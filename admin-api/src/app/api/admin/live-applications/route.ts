// admin-api/src/app/api/admin/live-applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LiveApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status"); // PENDING / APPROVED / REJECTED / null
    const pageParam = searchParams.get("page") ?? "1";
    const pageSizeParam = searchParams.get("pageSize") ?? "10";

    const page = Math.max(1, Number(pageParam) || 1);
    const pageSize = Math.max(1, Math.min(50, Number(pageSizeParam) || 10));

    const where: { status?: LiveApplicationStatus } = {};

    if (
      statusParam === "PENDING" ||
      statusParam === "APPROVED" ||
      statusParam === "REJECTED"
    ) {
      where.status = statusParam;
    }

    const skip = (page - 1) * pageSize;

    const [total, pendingTotal, applications] = await Promise.all([
      prisma.liveApplication.count({ where }),
      prisma.liveApplication.count({ where: { status: "PENDING" } }),
      prisma.liveApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          user: {
            include: {
              country: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      pageSize,
      pendingTotal,
    });
  } catch (error) {
    console.error("Admin list live applications error:", error);
    return NextResponse.json(
      { error: "Failed to load live applications" },
      { status: 500 }
    );
  }
}
