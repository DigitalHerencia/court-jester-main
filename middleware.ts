// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/confirmation", "/api/auth/login", "/api/auth/confirm"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    console.warn(`Unauthorized access attempt to ${pathname} - No token present`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);

    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      console.warn(`Forbidden access: Offender attempted to access admin route: ${pathname}`);
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/offender/dashboard/")) {
      const segments = pathname.split("/");
      const pathId = Number(segments[3]);

      if (payload.role !== "offender" || payload.offenderId !== pathId) {
        console.warn(`Forbidden access: OffenderId mismatch. Token: ${payload.offenderId}, URL: ${pathId}`);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Invalid or expired token:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/offender/:path*", "/api/:path*"],
};
