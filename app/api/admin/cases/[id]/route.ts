// app/api/admin/cases/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { parseCasePdf } from '@/lib/pdf-parser';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { caseText, offenderId } = await request.json();
    if (!caseText || !offenderId) {
      return NextResponse.json({ success: false, error: 'Case text and offender ID are required' }, { status: 400 });
    }
    const result = await parseCasePdf(caseText, offenderId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Failed to parse case' }, { status: 500 });
    }
    return NextResponse.json({ success: true, caseId: result.caseId });
  } catch (error: any) {
    console.error('Error processing case:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
