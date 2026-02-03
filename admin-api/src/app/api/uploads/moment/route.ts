// admin-api/src/app/api/uploads/moment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { chmod } from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_MIMES = new Set(["video/mp4", "video/quicktime", "video/mov"]);

function getOrigin(req: NextRequest) {
  // behind nginx
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "";
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

function extFrom(mime: string, name?: string) {
  const m = (mime || "").toLowerCase();
  if (m.includes("image/jpeg")) return ".jpg";
  if (m.includes("image/png")) return ".png";
  if (m.includes("image/webp")) return ".webp";
  if (m.includes("video/mp4")) return ".mp4";
  if (m.includes("video/quicktime")) return ".mov";
  if (m.includes("video/mov")) return ".mov";

  if (name && name.includes(".")) {
    const ext = "." + name.split(".").pop()!.toLowerCase();
    if (ext.length <= 6) return ext;
  }
  return ".bin";
}

function normalizePublicBase(v?: string | null) {
  const s = (v ?? "").trim();
  if (!s) return "/uploads/moments";
  return s.startsWith("/") ? s.replace(/\/+$/, "") : `/${s.replace(/\/+$/, "")}`;
}

function normalizeUploadRoot(v?: string | null) {
  const s = (v ?? "").trim();
  return s || "/var/www/goldlive-uploads/moments";
}

function detectKind(kindRaw: string, mime: string): "image" | "video" {
  const k = (kindRaw || "").toLowerCase();
  if (k === "video") return "video";
  if (k === "image") return "image";

  // fallback: infer from mime
  if (VIDEO_MIMES.has(mime)) return "video";
  return "image";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const mime = (file.type || "").toLowerCase();

    const kindRaw = String(form.get("kind") ?? "");
    const kind = detectKind(kindRaw, mime);

    const okType = kind === "image" ? IMAGE_MIMES.has(mime) : VIDEO_MIMES.has(mime);
    if (!okType) {
      return NextResponse.json(
        { error: `Unsupported ${kind} type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }

    const maxVideoMB = Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 500);
    const maxImageMB = Number(process.env.MAX_IMAGE_UPLOAD_MB ?? 10);
    const maxBytes = (kind === "video" ? maxVideoMB : maxImageMB) * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${kind === "video" ? `${maxVideoMB}MB` : `${maxImageMB}MB`})` },
        { status: 413 }
      );
    }

    // ✅ MUST match nginx alias:
    // location ^~ /uploads/moments/ { alias /var/www/goldlive-uploads/moments/; }
    const uploadRoot = normalizeUploadRoot(process.env.MOMENTS_UPLOAD_DIR);
    const publicBase = normalizePublicBase(process.env.MOMENTS_PUBLIC_BASE);

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const absDir = path.join(uploadRoot, year, month);
    await mkdir(absDir, { recursive: true });

    const ext = extFrom(file.type, file.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const absPath = path.join(absDir, filename);

    // Stream to disk
    const nodeReadable = Readable.fromWeb(file.stream() as any);
    await pipeline(nodeReadable, createWriteStream(absPath));

    // Ensure nginx can read it (common when created by node user)
    // 644 is enough; folder perms already handled by you
    try {
      await chmod(absPath, 0o644);
    } catch {
      // ignore
    }

    const publicPath = `${publicBase}/${year}/${month}/${filename}`; // relative path
    const url = `${getOrigin(req)}${publicPath}`; // absolute url

    return NextResponse.json({
      ok: true,
      kind,
      path: publicPath,
      url,
      meta: {
        mime,
        size: file.size,
        year,
        month,
      },
    });
  } catch (e: any) {
    console.error("[POST /api/uploads/moment]", e);
    return NextResponse.json(
      { error: e?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
