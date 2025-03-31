import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (token) {
      const session = await verifyToken(token)
      if (session && session.role === "offender" && session.offenderId) {
        await query(
          `
            INSERT INTO login_activity (
              offender_id,
              activity_type,
              ip_address,
              user_agent,
              created_at
            )
            VALUES ($1, 'logout', $2, $3, NOW())
          `,
          [
            session.offenderId,
            request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "unknown",
            request.headers.get("user-agent") || "unknown",
          ],
        )
      }
    }
    ;(await cookies()).delete("token")
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    ;(await cookies()).delete("token")
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  }
}

