import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { findUserByUsername, initializeAdminFromEnv, checkRateLimit, recordFailedLogin, recordSuccessfulLogin } from '@/lib/auth-db';
import { signJWT } from '@/lib/jwt';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // 1. Zkontrolovat Rate Limit (5 pokusů za hodinu per IP)
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: `Příliš mnoho pokusů. Vaše IP byla zablokována. Zkuste to za ${rateLimit.waitTimeMinutes} minut.` 
      }, { status: 429 });
    }

    // 2. Inicializace administrátora (spustí se jen pokud je DB prázdná)
    await initializeAdminFromEnv();

    const rawData = await request.json();
    
    const authSchema = z.object({
      username: z.string().min(1).max(50),
      password: z.string().min(1).max(100),
    });

    const parsed = authSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatný formát dat' }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // 3. Najdeme uživatele
    const user = await findUserByUsername(username);
    if (!user) {
      // Bezpečnostní zpoždění proti útokům (časování)
      await new Promise(r => setTimeout(r, 1000));
      await recordFailedLogin(ip, username);
      return NextResponse.json({ error: 'Neplatné přihlašovací údaje' }, { status: 401 });
    }

    // 4. Ověříme heslo přes bcrypt
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      // Záměrné zpoždění proti brute-force
      await new Promise(r => setTimeout(r, 1000));
      await recordFailedLogin(ip, username);
      return NextResponse.json({ error: 'Neplatné přihlašovací údaje' }, { status: 401 });
    }

    // 5. Zaznamenáme úspěch a vytvoříme cookie s JWT
    await recordSuccessfulLogin(ip, username);
    
    const token = await signJWT({ username: user.username, role: user.role });
    
    cookies().set('inflexion_secops_session', token, { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, 
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hodin
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}

// Endpoint pro odhlášení (smazání cookie)
export async function DELETE() {
  cookies().delete('inflexion_secops_session');
  return NextResponse.json({ success: true });
}
