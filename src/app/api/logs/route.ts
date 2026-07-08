import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuditLogs } from '@/lib/auth-db';

function checkAuth() {
  const session = cookies().get('inflexion_secops_session');
  return !!session;
}

export async function GET() {
  if (!checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const logs = getAuditLogs();
  return NextResponse.json(logs);
}
