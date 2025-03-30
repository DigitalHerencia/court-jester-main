import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Return system settings from environment variables
    const settings = {
      pdf_generation: process.env.ENABLE_PDF_GENERATION === "true",
      email_notifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === "true",
      admin_code: process.env.ADMIN_CODE || "",
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    }

    return NextResponse.json({
      settings,
    })
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return NextResponse.json({ error: "An error occurred while fetching system settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.settings) {
      return NextResponse.json({ error: "Missing settings object" }, { status: 400 })
    }

    const { settings } = body

    // In a real application, you would update environment variables or database settings
    // For this example, we'll just return success

    // Validate settings
    if (settings.admin_code && settings.admin_code.length < 4) {
      return NextResponse.json({ error: "Admin code must be at least 4 characters" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "System settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating system settings:", error)
    return NextResponse.json({ error: "An error occurred while updating system settings" }, { status: 500 })
  }
}

