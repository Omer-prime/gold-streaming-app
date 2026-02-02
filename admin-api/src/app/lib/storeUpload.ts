// src/lib/storeUpload.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const DEFAULT_MAX_IMAGE_MB = 15;
const DEFAULT_MAX_VIDEO_MB = 150;

function getOrigin(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

function safeExtFromMime(mime: string) {
  const m = (mime || "").toLowerCase();
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  if (m === "video/mp4") return "mp4";
  if (m === "video/webm") return "webm";
  if (m === "video/quicktime") return "mov";
  return "bin";
}

function isAllowed(mime: string) {
  const m = (mime || "").toLowerCase();
  return m.startsWith("image/") || m.startsWith("video/");
}

export async function handleStoreUpload(req: NextRequest) {
  try {
    const form = await req.formData();
    const fileAny = form.get("file");

    if (!fileAny || typeof (fileAny as any)?.arrayBuffer !== "function") {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const file = fileAny as unknown as File;
    const mime = (file.type || "").toLowerCase();

    if (!isAllowed(mime)) {
      return NextResponse.json(
        { error: "Only image/video files are allowed" },
        { status: 415 }
      );
    }

    const maxImageMB = Number(process.env.STORE_MAX_IMAGE_MB ?? DEFAULT_MAX_IMAGE_MB);
    const maxVideoMB = Number(process.env.STORE_MAX_VIDEO_MB ?? DEFAULT_MAX_VIDEO_MB);
    const limitBytes =
      (mime.startsWith("video/") ? maxVideoMB : maxImageMB) * 1024 * 1024;

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > limitBytes) {
      return NextResponse.json(
        { error: `File too large. Max ${mime.startsWith("video/") ? maxVideoMB : maxImageMB}MB` },
        { status: 413 }
      );
    }

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");

    // ✅ IMPORTANT:
    // store files in a stable folder (served by nginx alias)
    const uploadRoot =
      process.env.STORE_UPLOAD_DIR ?? path.join(process.cwd(), "uploads-store");
    const publicBase = process.env.STORE_PUBLIC_BASE ?? "/uploads/store";

    const absDir = path.join(uploadRoot, yyyy, mm);
    await fs.mkdir(absDir, { recursive: true });

    const ext = safeExtFromMime(mime);
    const filename = `${crypto.randomUUID()}.${ext}`;
    const absPath = path.join(absDir, filename);

    await fs.writeFile(absPath, bytes);

    const publicPath = `${publicBase}/${yyyy}/${mm}/${filename}`.replace(/\\/g, "/");
    const url = `${getOrigin(req)}${publicPath}`;

    return NextResponse.json(
      { ok: true, path: publicPath, url, mime, size: bytes.length },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
