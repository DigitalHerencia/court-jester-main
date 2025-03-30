import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const offenderId = params.id

    // Check if offender exists
    const offenderResult = await query("SELECT * FROM offenders WHERE id = $1", [offenderId])

    if (offenderResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Offender not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("mugshot") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, and GIF are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`offenders/${offenderId}/mugshot.${file.type.split("/")[1]}`, file, {
      access: "public",
    })

    // Update offender record with mugshot URL
    await query("UPDATE offenders SET mugshot_url = $1 WHERE id = $2", [blob.url, offenderId])

    return NextResponse.json({
      success: true,
      mugshot_url: blob.url,
    })
  } catch (error: any) {
    console.error("Error uploading mugshot:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

