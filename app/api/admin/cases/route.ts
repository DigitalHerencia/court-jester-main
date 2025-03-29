import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { parseCasePdf } from "@/lib/pdf-parser"

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only allow admin to create cases
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { caseText, offenderId } = await request.json()

    if (!caseText || !offenderId) {
      return NextResponse.json({ error: "Case text and offender ID are required" }, { status: 400 })
    }

    const result = await parseCasePdf(caseText, offenderId)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to parse case" }, { status: 500 })
    }

    return NextResponse.json({ success: true, caseId: result.caseId })
  } catch (error) {
    console.error("Error processing case", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

