import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const kind = String(form.get("kind") ?? "image"); // "image" | "video"
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // basic size guard (adjust if needed)
    const maxBytes = kind === "video" ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${kind === "video" ? "200MB" : "10MB"})` },
        { status: 413 }
      );
    }

    const ext = extFrom(file.type, file.name);
    const id = crypto.randomUUID();

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const relDir = `/uploads/moments/${year}/${month}`;
    const absDir = path.join(process.cwd(), "public", relDir);

    await mkdir(absDir, { recursive: true });

    const filename = `${id}${ext}`;
    const absPath = path.join(absDir, filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(absPath, buf);

    const publicPath = `${relDir}/${filename}`; // starts with /uploads/...
    const url = `${getOrigin(req)}${publicPath}`;

    return NextResponse.json({ url, path: publicPath, kind });
  } catch (e) {
    console.error("[POST /api/uploads/moment]", e);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
