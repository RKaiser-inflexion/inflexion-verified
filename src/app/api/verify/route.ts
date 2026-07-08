import { NextResponse } from 'next/server';
import { getAdvisors, logApiCall } from '@/lib/db';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function addCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return res;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rl = await checkApiRateLimit(ip, 100, 60 * 1000); // 100 requestů za minutu
  
  if (!rl.success) {
    return addCorsHeaders(NextResponse.json({ error: 'Too Many Requests' }, { status: 429 }));
  }

  if (!domain) {
    return addCorsHeaders(NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 }));
  }

  // Clean domain (remove www. and port for matching)
  const cleanDomain = domain.replace(/^www\./, '').split(':')[0];

  // 1. Zkusíme Redis Cache
  if (redis) {
    try {
      const cachedResult = await redis.get(`verify:${cleanDomain}`);
      if (cachedResult) {
        return addCorsHeaders(NextResponse.json(cachedResult));
      }
    } catch (e) {
      console.error('Redis cache fetch failed:', e);
    }
  }

  // 2. Fallback na Postgres DB
  const advisors = await getAdvisors();
  const advisor = advisors[cleanDomain as keyof typeof advisors];

  let responseData;

  if (advisor) {
    // Zaznamenání analytiky
    if (!advisor.isDemo) {
      await logApiCall();
    }
    
    responseData = {
      status: 'verified',
      timestamp: new Date().toISOString(),
      advisor: {
        name: advisor.name,
        role: advisor.role,
        photoUrl: advisor.photoUrl,
        email: advisor.email,
        phone: advisor.phone
      }
    };
  } else {
    // HONEYPOT LOGIC
    console.warn(`\n🚨 HONEYPOT ALERT: Pokus o falšování identity na neznámé doméně: ${cleanDomain}`);
    console.warn(`🛡️  Automatické nahlášení domény ${cleanDomain} do databází Google Safe Browsing... (simulace)\n`);

    responseData = {
      status: 'scam',
      timestamp: new Date().toISOString(),
      message: 'Unauthorized domain'
    };
  }

  // Uložíme do Cache na 1 hodinu (3600 vteřin)
  if (redis) {
    try {
      await redis.setex(`verify:${cleanDomain}`, 3600, responseData);
    } catch (e) {
      console.error('Redis cache set failed:', e);
    }
  }

  return addCorsHeaders(NextResponse.json(responseData, { status: advisor ? 200 : 403 }));
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res);
}
