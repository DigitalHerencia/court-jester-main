import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";
import { generateMotionPdf, type MotionPdfData } from "@/lib/pdf-generator";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: templateId } = await params;
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the motion template details from DB
    const templateRes = await query("SELECT title, content, category FROM motion_templates WHERE id = $1", [templateId]);
    if (templateRes.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const template = templateRes.rows[0] as { title: string; content: string; category: string };

    // Prepare PDF data (assuming we might need case number or other context; using template title as placeholder case number)
    const pdfData: MotionPdfData = {
      motionTitle: template.title,
      motionContent: template.content,
      caseNumber: template.category || "N/A",
      courtName: "",
      offenderName: "",
      filingDate: ""
    };

    // Generate PDF bytes
    const pdfBytes = await generateMotionPdf(pdfData);
    const pdfBuffer = Buffer.from(pdfBytes);

    // Upload PDF to blob storage (or any storage) and get URL
    const blobResult = await put(`motion-${templateId}.pdf`, pdfBuffer, {
      contentType: "application/pdf",
      access: "public"
    });
    const pdfUrl = blobResult.url;

    // Update the motion_template record with the PDF URL
    await query("UPDATE motion_templates SET pdf_url = $1, modified_at = NOW() WHERE id = $2", [pdfUrl, templateId]);

    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error("Error generating motion PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
