import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUsers, addUser, deleteUser, updateUserRole } from '@/lib/auth-db';
import { verifyJWT } from '@/lib/jwt';

// Pomocná fce pro ověření admina a jeho role
async function getAuthSession() {
  const sessionCookie = cookies().get('inflexion_secops_session');
  if (!sessionCookie) return null;
  const payload = await verifyJWT(sessionCookie.value);
  return payload as { username: string, role: string } | null;
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const users = await getUsers();
    const safeUsers = users.map(u => ({
      username: u.username,
      role: u.role,
      createdAt: u.createdAt
    }));
    return NextResponse.json({ users: safeUsers, currentUser: session });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Pro tuto akci potřebujete oprávnění Superadmina' }, { status: 403 });
  }
  
  try {
    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 });
    }
    
    await addUser({ username, role }, password);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Pro tuto akci potřebujete oprávnění Superadmina' }, { status: 403 });
  }

  try {
    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: 'Chybí username' }, { status: 400 });
    
    if (username === session.username) {
      return NextResponse.json({ error: 'Nemůžete smazat svůj vlastní účet' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await deleteUser(username, ip, session.username);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Pro tuto akci potřebujete oprávnění Superadmina' }, { status: 403 });
  }

  try {
    const { username, role } = await request.json();
    if (!username || !role) return NextResponse.json({ error: 'Chybí data' }, { status: 400 });
    
    if (username === session.username && role !== 'superadmin') {
      return NextResponse.json({ error: 'Nemůžete si sám sobě odebrat roli superadmina' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await updateUserRole(username, role as 'admin' | 'superadmin', ip, session.username);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
