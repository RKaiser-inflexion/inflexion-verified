import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUsers, addUser } from '@/lib/auth-db';

// Pomocná fce pro ověření admina
function checkAuth() {
  const session = cookies().get('inflexion_secops_session');
  return !!session;
}

export async function GET() {
  if (!checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const users = getUsers().map(u => ({
    username: u.username,
    role: u.role,
    createdAt: u.createdAt
  }));
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  if (!checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 });
    }
    
    addUser({ username, role }, password);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
