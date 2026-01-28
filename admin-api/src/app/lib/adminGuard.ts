// src/lib/adminGuard.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function requireAdmin(req: NextRequest) {
  // 1) Prefer JWT cookie (same logic as middleware)
  const token = req.cookies.get("gl_auth_token")?.value;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.json({ error: "JWT_SECRET missing" }, { status: 500 });
      }

      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

      if (payload.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return null; // ✅ allowed
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 2) Optional: allow server-to-server by API key too (keep if you want)
  const apiKey = process.env.ADMIN_API_KEY;
  const provided = req.headers.get("x-admin-api-key");
  if (apiKey && provided === apiKey) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
