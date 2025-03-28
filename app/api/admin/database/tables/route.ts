// app/api/admin/database/tables/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tableNames = ['users', 'offenders', 'cases', 'charges', 'hearings', 'motions', 'notifications', 'reminders'];
    const counts: { [key: string]: number } = {};

    for (const table of tableNames) {
      const result = await query(`SELECT COUNT(*) AS count FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count, 10);
    }

    return NextResponse.json({ success: true, counts });
  } catch (error: any) {
    console.error('Error fetching table counts:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
