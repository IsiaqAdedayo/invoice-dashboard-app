import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard/admin", "/dashboard/customer"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token");

  const path = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));

  if ((isProtected || path === "/") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // if (path.startsWith("/dashboard/admin")) {
  //   return token?.role === "admin";
  // }

  // if (path.startsWith("/dashboard/customer")) {
  //   return !!token;
  // // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/admin/:path*", "/dashboard/customer/:path*", "/"],
};
