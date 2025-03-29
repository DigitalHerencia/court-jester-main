// app/api/offenders/[id]/mugshot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireOffender } from "@/lib/auth";
import { query } from "@/lib/db";


async function getOffenderMugshotUrl(offenderId: number): Promise<string> {
  const result = await query(
    `SELECT mugshot_url FROM offenders WHERE id = $1`,
    [offenderId]
  );

  if (result.rowCount === 0) {
    throw new Error("Offender not found");
  }

  const mugshotUrl = result.rows[0].mugshot_url;
  if (!mugshotUrl) {
    throw new Error("Mugshot URL not available");
  }

  return mugshotUrl;
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  const payload = await requireOffender(token);
  if (!payload || payload.offenderId !== Number(params.id)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = await getOffenderMugshotUrl(Number(params.id));
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Error fetching mugshot:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
