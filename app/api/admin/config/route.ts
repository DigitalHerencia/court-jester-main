import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return configuration settings
    return NextResponse.json({
      enablePdfGeneration: process.env.ENABLE_PDF_GENERATION,
      enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "3.0.0",
    })
  } catch (error) {
    console.error("Error fetching config:", error)
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 })
  }
}

