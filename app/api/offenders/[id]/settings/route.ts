import { NextRequest, NextResponse } from 'next/server';
import { requireOffender } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireOffender(token);
  if (!session || session.offenderId!== Number(params.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Retrieve personal settings for this offender
    const result = await query(
      `
      SELECT key, value, updated_at 
      FROM offender_settings
      WHERE offender_id = $1
      ORDER BY key
      `,
      [params.id]
    );
    return NextResponse.json({ settings: result.rows });
  } catch (error) {
    console.error('Error fetching offender settings', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireOffender(token);
  if (!session || session.offenderId !== Number(params.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }
    await query(
      `
      UPDATE offender_settings
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE offender_id = $2 AND key = $3
      `,
      [value, params.id, key]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating offender setting', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
