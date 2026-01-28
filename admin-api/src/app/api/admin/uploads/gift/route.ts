// src/app/api/admin/uploads/gift/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gifts");

function safeExt(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  // allow common gift formats
  const ok = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".webm"];
  return ok.includes(ext) ? ext : "";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // @ts-expect-error - Next runtime File type
    const f: File = file;

    const ext = safeExt(f.name);
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // size limit (you can increase later)
    const maxBytes = 20 * 1024 * 1024; // 20MB
    if (f.size > maxBytes) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 413 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const buf = Buffer.from(await f.arrayBuffer());
    const id = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${id}${ext}`;
    const abs = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(abs, buf);

    const url = `/uploads/gifts/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[POST /api/admin/uploads/gift]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
