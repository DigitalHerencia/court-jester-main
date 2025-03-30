import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    // Validate settings
    if (!settings.smtp_host || !settings.smtp_port || !settings.from_email) {
      return NextResponse.json({ error: "Missing required email settings" }, { status: 400 })
    }

    // In a real application, you would attempt to send a test email here
    // For this example, we'll just simulate a successful test

    // Simulate a delay to make it feel like we're actually testing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
    })
  } catch (error) {
    console.error("Error testing email settings:", error)
    return NextResponse.json({ error: "An error occurred while testing email settings" }, { status: 500 })
  }
}

