import { NextRequest, NextResponse } from 'next/server';
import { requireOffender } from '@/lib/auth';
import { parseCasePdf } from '@/lib/pdf-parser';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireOffender(token);
  // Ensure the session's offender ID matches the URL parameter
  if (!session || session.offenderId !== Number(params.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { caseText } = await request.json();
    if (!caseText) {
      return NextResponse.json({ error: 'Case text is required' }, { status: 400 });
    }
    // Use the offender's id from the URL (or session) for processing
    const result = await parseCasePdf(caseText, Number(params.id));
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to parse case' }, { status: 500 });
    }
    return NextResponse.json({ success: true, caseId: result.caseId });
  } catch (error: any) {
    console.error('Error processing case', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

