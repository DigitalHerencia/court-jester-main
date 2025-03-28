// app/api/offenders/[id]/mugshot/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { uploadMugshot } from '@/lib/blob';
import { query } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';

// Disable Next.js built-in body parsing for multipart forms
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Convert NextRequest to Node's IncomingMessage for formidable compatibility
    const nodeReq = request as unknown as IncomingMessage;

    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      (form.parse as any)(nodeReq, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const offenderId = params.id;
    const file = files.mugshot;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    // Validate file type – only JPEG and PNG are allowed.
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG and PNG are allowed.' },
        { status: 400 }
      );
    }

    const fileBuffer = await fs.promises.readFile(file.path);
    const filename = file.originalFilename;
    const mimeType = file.mimetype;

    // Upload file to Vercel Blob storage
    const fileUrl = await uploadMugshot(fileBuffer, filename, mimeType);

    // Update the offender record with the uploaded mugshot URL
    await query('UPDATE offenders SET mugshot_url = $1 WHERE id = $2', [fileUrl, offenderId]);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('Error uploading mugshot:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
