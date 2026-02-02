import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";



const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB

function getOrigin(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

function safeExtFrom(mime: string, name?: string) {
  const m = (mime || "").toLowerCase();

  if (m === "image/jpeg") return ".jpg";
  if (m === "image/png") return ".png";
  if (m === "image/webp") return ".webp";
  if (m === "image/gif") return ".gif";

  if (m === "video/mp4") return ".mp4";
  if (m === "video/webm") return ".webm";
  if (m === "video/quicktime") return ".mov";

  if (name && name.includes(".")) {
    const ext = "." + name.split(".").pop()!.toLowerCase();
    if (ext.length <= 6) return ext;
  }
  return ".bin";
}

function isAllowed(mime: string) {
  const m = (mime || "").toLowerCase();
  return m.startsWith("image/") || m.startsWith("video/");
}

export async function handleStoreUpload(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const mime = (file.type || "").toLowerCase();
  if (!isAllowed(mime)) {
    return NextResponse.json(
      { error: "Only image/video files are allowed" },
      { status: 400 }
    );
  }

  const isVideo = mime.startsWith("video/");
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (file.size > limit) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.round(limit / (1024 * 1024))}MB` },
      { status: 413 }
    );
  }

  const ext = safeExtFrom(mime, file.name);
  const id = crypto.randomUUID();

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const uploadRoot =
    process.env.STORE_UPLOAD_DIR ??
    path.join(process.cwd(), "uploads", "store"); // fallback for local dev

  const publicBase = process.env.STORE_PUBLIC_BASE ?? "/uploads/store";

  const absDir = path.join(uploadRoot, year, month);
  await mkdir(absDir, { recursive: true });

  const filename = `${id}${ext}`;
  const absPath = path.join(absDir, filename);

  const nodeReadable = Readable.fromWeb(file.stream() as any);
  await pipeline(nodeReadable, createWriteStream(absPath));

  const publicPath = `${publicBase}/${year}/${month}/${filename}`;
  const url = `${getOrigin(req)}${publicPath}`;

  return NextResponse.json(
    { ok: true, path: publicPath, url, mime, size: file.size },
    { status: 200 }
  );
}
