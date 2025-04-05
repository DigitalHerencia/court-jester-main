import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

async function getOffenderMugshotUrl(offenderId: number): Promise<string> {
  const result = await query(`SELECT mugshot_url FROM offenders WHERE id = $1`, [offenderId])
  if (result.rowCount === 0) {
    throw new Error("Offender not found")
  }
  const mugshotUrl = result.rows[0].mugshot_url
  if (!mugshotUrl) {
    throw new Error("Mugshot not found")
  }
  return mugshotUrl
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Ensure the user is authorized to access this mugshot
  if (!session || (session.role !== "admin" && session.offenderId !== Number(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const mugshotUrl = await getOffenderMugshotUrl(Number(id))
    return NextResponse.json({ mugshot_url: mugshotUrl })
  } catch (error: unknown) {
    if ((error as Error).message === "Offender not found") {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    if ((error as Error).message === "Mugshot not found") {
      return NextResponse.json({ error: "Mugshot not found" }, { status: 404 })
    }
    console.error("Error fetching mugshot:", error)
    return NextResponse.json({ error: "Failed to fetch mugshot" }, { status: 500 })
  }
}
