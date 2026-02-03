import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function pageParams(sp: URLSearchParams) {
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(100, Math.max(5, Number(sp.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") ?? "OPEN").toUpperCase();
    const { page, limit, skip } = pageParams(searchParams);

    const where = { status: status as any };

    const total = await prisma.helpFeedback.count({ where });

    const rows = await prisma.helpFeedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        status: r.status,
        type: r.type,
        category: r.category,
        subject: r.subject,
        message: r.message,
        replyText: r.replyText,
        user: r.user,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("admin/help/feedback GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
