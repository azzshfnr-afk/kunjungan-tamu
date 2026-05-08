import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sso_token")?.value;
  const { pathname } = req.nextUrl;


  if (pathname.startsWith("/karyawan") && !pathname.startsWith("/karyawan/login")) {
    if (!token) {
      const loginUrl = new URL("/karyawan/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/karyawan/login") && token) {
    const dashboardUrl = new URL("/karyawan/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/karyawan/:path*"],
};