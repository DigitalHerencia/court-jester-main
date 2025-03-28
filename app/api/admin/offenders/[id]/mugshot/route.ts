import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { uploadMugshot } from "@/lib/blob"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("mugshot") as File

    if (!file) {
      return NextResponse.json({ error: "Mugshot file is required" }, { status: 400 })
    }

    // Get offender inmate number
    const offenderResult = await query(
      `
      SELECT inmate_number FROM offenders WHERE id = $1
    `,
      [params.id],
    )

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    const inmateNumber = offenderResult.rows[0].inmate_number

    // Upload mugshot to Vercel Blob
    const mugshotUrl = await uploadMugshot(file, inmateNumber)

    // Update offender record with mugshot URL
    await query(
      `
      UPDATE offenders SET mugshot_url = $1 WHERE id = $2
    `,
      [mugshotUrl, params.id],
    )

    return NextResponse.json({ success: true, mugshotUrl })
  } catch (error) {
    console.error("Error uploading mugshot", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

