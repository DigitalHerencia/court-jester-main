// app/api/admin/offenders/[id]/mugshot/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadMugshot } from "@/lib/blob";
import { query } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("mugshot") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Mugshot file is required" }, { status: 400 });
    }

    // Get offender inmate number
    const offenderResult = await query(
      `SELECT inmate_number FROM offenders WHERE id = $1`,
      [params.id]
    );

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ success: false, error: "Offender not found" }, { status: 404 });
    }

    const inmateNumber = offenderResult.rows[0].inmate_number;

    // Convert the File object (Web API) to a Buffer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload mugshot to Vercel Blob, passing the file buffer, a filename based on inmate number, and the file's MIME type.
    const mugshotUrl = await uploadMugshot(buffer, `${inmateNumber}-mugshot.jpg`, file.type);

    // Update offender record with the mugshot URL.
    await query(
      `UPDATE offenders SET mugshot_url = $1 WHERE id = $2`,
      [mugshotUrl, params.id]
    );

    return NextResponse.json({ success: true, mugshotUrl });
  } catch (error: any) {
    console.error("Error uploading mugshot", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
