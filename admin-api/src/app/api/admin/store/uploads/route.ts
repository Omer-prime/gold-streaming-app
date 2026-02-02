import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB

function safeExtFromMime(mime: string) {
  const m = (mime || "").toLowerCase();
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  if (m === "video/mp4") return "mp4";
  if (m === "video/webm") return "webm";
  if (m === "video/quicktime") return "mov";
  return null;
}

function isAllowed(mime: string) {
  const m = (mime || "").toLowerCase();
  return m.startsWith("image/") || m.startsWith("video/");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fileAny = form.get("file");

    if (!fileAny || typeof (fileAny as any)?.arrayBuffer !== "function") {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const file = fileAny as unknown as File;
    const mime = (file.type || "").toLowerCase();

    if (!isAllowed(mime)) {
      return NextResponse.json({ error: "Only image/video files are allowed" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const isVideo = mime.startsWith("video/");
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

    if (bytes.length > limit) {
      return NextResponse.json(
        { error: `File too large. Max ${Math.round(limit / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    const ext = safeExtFromMime(mime) || "bin";

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");

    const relDir = path.join("uploads", "store", yyyy, mm);
    const absDir = path.join(process.cwd(), "public", relDir);

    await fs.mkdir(absDir, { recursive: true });

    const name = `${crypto.randomUUID()}.${ext}`;
    const absPath = path.join(absDir, name);

    await fs.writeFile(absPath, bytes);

    const url = `/${relDir.replace(/\\/g, "/")}/${name}`;

    return NextResponse.json({
      ok: true,
      url,
      mime,
      size: bytes.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 400 });
  }
}
