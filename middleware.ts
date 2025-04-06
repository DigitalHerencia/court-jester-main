import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Define paths that don't require authentication
const PUBLIC_PATHS = ["/", "/confirmation", "/api/auth/login", "/api/auth/confirm"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for token
  const token = request.cookies.get("token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const { payload } = await jwtVerify(token, secret)

    // Route based on role
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Ensure offenders can only access their own data
    if (pathname.startsWith("/offender/dashboard/")) {
      const pathParts = pathname.split("/")
      const pathOffenderId = pathParts[3] // /offender/dashboard/:id/...

      if (payload.role === "offender" && payload.offenderId !== Number.parseInt(pathOffenderId)) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid token
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/offender/:path*", "/api/:path*"],
}

