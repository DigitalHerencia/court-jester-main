// app/api/admin/database/connection/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const testResult = await query('SELECT 1 as test');
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      test: testResult.rows[0],
    });
  } catch (error: any) {
    console.error('Error checking database connection:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
