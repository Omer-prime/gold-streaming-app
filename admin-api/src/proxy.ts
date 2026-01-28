// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get("gl_auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/admin-login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing");

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (payload.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/admin-login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("gl_auth_token", "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
