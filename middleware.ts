import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Updated verifyToken that works in the Edge runtime
export async function verifyToken(token: string) {
  try {
    // Ensure you have a JWT secret set in your environment variables (e.g., process.env.JWT_SECRET)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-default-secret");
    const { payload } = await jwtVerify(token, secret);
    return payload; // Return payload if token is valid
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Allow public paths: login page, auth routes, and static assets.
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Await the verification using jose, which supports the Edge runtime.
  const payload = token ? await verifyToken(token) : null;
  if (!token || !payload) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/offender/:path*"],
};
