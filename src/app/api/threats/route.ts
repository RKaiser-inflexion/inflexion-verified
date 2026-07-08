import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getThreats, updateThreatStatus } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  const session = cookies().get('inflexion_secops_session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const threats = getThreats();
    return NextResponse.json(threats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch threats' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = cookies().get('inflexion_secops_session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const rawData = await request.json();
    
    const threatUpdateSchema = z.object({
      id: z.string().min(1).max(100),
      status: z.enum(['PENDING', 'ACTIVE', 'BLOCKED', 'RESOLVED']),
    });

    const parsed = threatUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data', details: parsed.error.issues }, { status: 400 });
    }

    const { id, status } = parsed.data;

    updateThreatStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update threat' }, { status: 500 });
  }
}
