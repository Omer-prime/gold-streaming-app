import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

type Audience = "ALL_USERS" | "ALL_HOSTS" | "SPECIFIC_USERS";

function parseIdentifiers(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .flatMap((x) => x.split(/[\n,]/g).map((s) => s.trim()))
    .filter(Boolean);
}

async function requireAdmin(req: NextRequest) {
  const token =
    req.cookies.get("gl_auth_token")?.value ??
    req.cookies.get("gl_admin_token")?.value;

  if (!token) {
    return { ok: false as const, status: 401, error: "Not authenticated" };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false as const, status: 500, error: "JWT_SECRET missing" };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (payload?.role !== "ADMIN") {
      return { ok: false as const, status: 403, error: "Forbidden" };
    }

    const adminId = typeof payload.sub === "string" ? payload.sub : "";
    if (!adminId) {
      return { ok: false as const, status: 401, error: "Invalid token" };
    }

    return { ok: true as const, adminId };
  } catch {
    return { ok: false as const, status: 401, error: "Invalid/expired token" };
  }
}

// POST /api/admin/notifications
// Body: { audience, identifiers?, type?, title, body, metaJson? }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));

  const audience = (body?.audience ?? "ALL_USERS") as Audience;
  const type = typeof body?.type === "string" && body.type.trim() ? body.type.trim() : "ADMIN";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const messageBody = typeof body?.body === "string" ? body.body.trim() : "";
  const metaJson = body?.metaJson ?? null;

  if (!title || !messageBody) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 }
    );
  }

  const identifiers = parseIdentifiers(body?.identifiers);

  // 1) Resolve targets
  let targetUserIds: string[] = [];

  if (audience === "ALL_USERS") {
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map((u) => u.id);
  } else if (audience === "ALL_HOSTS") {
    const users = await prisma.user.findMany({
      where: { role: "HOST" },
      select: { id: true },
    });
    targetUserIds = users.map((u) => u.id);
  } else if (audience === "SPECIFIC_USERS") {
    if (identifiers.length === 0) {
      return NextResponse.json(
        { error: "identifiers are required for SPECIFIC_USERS" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: { in: identifiers } },
          { username: { in: identifiers } },
          { email: { in: identifiers } },
        ],
      },
      select: { id: true },
    });

    targetUserIds = users.map((u) => u.id);

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No users matched the provided identifiers" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
  }

  // 2) Create campaign + per-user rows
  const campaign = await prisma.adminNotification.create({
    data: {
      createdById: auth.adminId,
      audience,
      targetUserIds: audience === "SPECIFIC_USERS" ? targetUserIds : [],
      type,
      title,
      body: messageBody,
      metaJson: metaJson ?? undefined,
    },
  });

  // Create user notifications in chunks (safe for big user base)
  const CHUNK = 1000;
  let created = 0;

  for (let i = 0; i < targetUserIds.length; i += CHUNK) {
    const slice = targetUserIds.slice(i, i + CHUNK);
    const data = slice.map((userId) => ({
      userId,
      type,
      title,
      body: messageBody,
      metaJson: metaJson ?? undefined,
      adminNotificationId: campaign.id,
    }));

    await prisma.notification.createMany({ data });
    created += slice.length;
  }

  return NextResponse.json({
    success: true,
    adminNotificationId: campaign.id,
    audience,
    targeted: targetUserIds.length,
    created,
  });
}
