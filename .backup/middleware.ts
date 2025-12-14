// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // We only protect /admin and everything under it
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Read NextAuth JWT from cookies
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ❌ Not logged in -> send to /admin-login
  if (!token) {
    const loginUrl = new URL("/admin-login", req.url);
    // optional: send them back to the page they wanted after login
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ If you also store role on the token, you can enforce ADMIN only:
  // if (token.role !== "ADMIN") {
  //   return new NextResponse("Forbidden", { status: 403 });
  // }

  return NextResponse.next();
}

// This tells Next.js which routes the middleware should run on
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
