import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (pathname === "/" || pathname === "/confirmation" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check for token
  const token = request.cookies.get("token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verify token
  try {
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
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

