import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { parseOffenderProfile } from "@/lib/profile-parser"

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { profileText } = await request.json()

    if (!profileText) {
      return NextResponse.json({ error: "Profile text is required" }, { status: 400 })
    }

    const result = await parseOffenderProfile(profileText)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to parse profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, offenderId: result.offenderId })
  } catch (error) {
    console.error("Error processing profile", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

