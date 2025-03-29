import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = params;
    // Retrieve the motion with JOINs for additional context
    const result = await query(
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
      WHERE m.id = $1
      `,
      [id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Motion not found' }, { status: 404 });
    }
    return NextResponse.json({ motion: result.rows[0] });
  } catch (error) {
    console.error('Error fetching motion:', error);
    return NextResponse.json({ error: 'Failed to fetch motion' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content } = body;
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    const result = await query(
      `
      UPDATE motions 
      SET title = $1, content = $2, updated_at = NOW() 
      WHERE id = $3 
      RETURNING id, title, content, created_at, updated_at
      `,
      [title, content, id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Motion not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ motion: result.rows[0] });
  } catch (error) {
    console.error('Error updating motion:', error);
    return NextResponse.json({ error: 'Failed to update motion' }, { status: 500 });
  }
}
