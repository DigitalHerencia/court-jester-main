// app/api/admin/database/reset/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { resetDatabase, seedDatabase } from '@/lib/db-schema';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const resetResult = await resetDatabase();
    if (!resetResult.success) {
      return NextResponse.json({ success: false, error: resetResult.error || 'Failed to reset database' }, { status: 500 });
    }
    const seedResult = await seedDatabase();
    if (!seedResult.success) {
      return NextResponse.json({ success: false, error: seedResult.error || 'Failed to seed database' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
