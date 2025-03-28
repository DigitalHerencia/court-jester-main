import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old dashboard URLs to new structure
  if (pathname.startsWith("/dashboard/admin")) {
    return NextResponse.redirect(new URL(pathname.replace("/dashboard/admin", "/admin/dashboard"), request.url))
  }

  if (pathname.startsWith("/dashboard/offender")) {
    return NextResponse.redirect(new URL(pathname.replace("/dashboard/offender", "/offender/dashboard"), request.url))
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

