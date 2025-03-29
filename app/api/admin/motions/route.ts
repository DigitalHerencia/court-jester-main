import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Retrieve motions with additional context via JOINs:
    // - Join with cases to get judge and venue
    // - Join with offenders to get full offender name
    const motionsResult = await query(
      `
      SELECT 
        m.id, 
        m.title, 
        m.content, 
        m.created_at, 
        m.updated_at, 
        CONCAT(o.first_name, ' ', o.last_name) AS "offenderName",
        c.judge,
        c.venue
      FROM motions m
      JOIN cases c ON m.case_id = c.id
      JOIN offenders o ON c.offender_id = o.id
      ORDER BY m.updated_at DESC
      `
    );
    return NextResponse.json({ motions: motionsResult.rows });
  } catch (error) {
    console.error('Error fetching motions:', error);
    return NextResponse.json({ error: 'Failed to fetch motions' }, { status: 500 });
  }
}
