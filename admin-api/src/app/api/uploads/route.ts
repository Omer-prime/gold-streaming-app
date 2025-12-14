import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Optional: increase if your uploads are slow/big
export const maxDuration = 300;

function getOrigin(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

function extFrom(mime: string, name?: string) {
  const m = (mime || "").toLowerCase();

  if (m.includes("image/jpeg")) return ".jpg";
  if (m.includes("image/png")) return ".png";
  if (m.includes("image/webp")) return ".webp";

  if (m.includes("video/mp4")) return ".mp4";
  if (m.includes("video/quicktime")) return ".mov";

  if (name && name.includes(".")) {
    const ext = "." + name.split(".").pop()!.toLowerCase();
    if (ext.length <= 6) return ext;
  }
  return ".bin";
}

function isAllowed(kind: "image" | "video", mime: string) {
  const m = (mime || "").toLowerCase();
  if (kind === "image") {
    return m.includes("image/jpeg") || m.includes("image/png") || m.includes("image/webp");
  }
  // video
  return m.includes("video/mp4") || m.includes("video/quicktime");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const kindRaw = String(form.get("kind") ?? "image");
    const kind = (kindRaw === "video" ? "video" : "image") as "image" | "video";

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // Size guard (env override supported)
    const maxVideoMB = Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 200);
    const maxImageMB = Number(process.env.MAX_IMAGE_UPLOAD_MB ?? 10);
    const maxBytes = (kind === "video" ? maxVideoMB : maxImageMB) * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${kind === "video" ? `${maxVideoMB}MB` : `${maxImageMB}MB`})` },
        { status: 413 }
      );
    }

    // Type guard (helps avoid weird uploads)
    if (!isAllowed(kind, file.type)) {
      return NextResponse.json(
        { error: `Unsupported ${kind} type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }

    const ext = extFrom(file.type, file.name);
    const id = crypto.randomUUID();

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    /**
     * ✅ Choose storage path:
     * - Default: <project>/public/uploads/moments/...
     * - Optional (recommended with your nginx /media alias):
     *   MOMENTS_UPLOAD_DIR=/srv/gold-live/media/moments
     *   MOMENTS_PUBLIC_BASE=/media/moments
     */
    const uploadRoot =
      process.env.MOMENTS_UPLOAD_DIR ??
      path.join(process.cwd(), "public", "uploads", "moments");

    const publicBase = process.env.MOMENTS_PUBLIC_BASE ?? "/uploads/moments";

    const absDir = path.join(uploadRoot, year, month);
    await mkdir(absDir, { recursive: true });

    const filename = `${id}${ext}`;
    const absPath = path.join(absDir, filename);

    // ✅ Stream to disk (better than arrayBuffer for videos)
    const nodeReadable = Readable.fromWeb(file.stream() as any);
    await pipeline(nodeReadable, createWriteStream(absPath));

    const publicPath = `${publicBase}/${year}/${month}/${filename}`; // URL path
    const url = `${getOrigin(req)}${publicPath}`;

    return NextResponse.json({ url, path: publicPath, kind });
  } catch (e: any) {
    console.error("[POST /api/uploads/moment]", e);
    return NextResponse.json(
      { error: e?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
