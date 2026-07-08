import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

// Které cesty vyžadují autentizaci
const protectedApiRoutes = ['/api/advisors', '/api/threats', '/api/analytics', '/api/users', '/api/logs'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ochrana Admin sekce (kromě login stránky, ta ale neexistuje samostatně, login je v /admin)
  // Jelikož /admin obsahuje i přihlašovací formulář, nebudeme ho blokovat přes middleware, 
  // aby se zobrazil formulář. Blokujeme pouze chráněné API endpoints.

  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedApi) {
    const sessionCookie = request.cookies.get('inflexion_secops_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    const payload = await verifyJWT(sessionCookie.value);
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
  }

  // Přidání Security hlaviček (přepisujeme v next.config.mjs, ale můžeme i zde)
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
