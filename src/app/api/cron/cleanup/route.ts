import { NextResponse } from 'next/server';
import { cleanupOldThreats } from '@/lib/db';

export async function GET(request: Request) {
  // Pro bezpečí zajistíme, že tento endpoint lze volat jenom s tajným tokenem z cronu
  // V produkci se to obvykle řeší pomocí Authorization headeru (např. Vercel Cron Secret)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const modified = cleanupOldThreats();

  return NextResponse.json({ 
    success: true, 
    message: modified ? 'PII data byla pročištěna.' : 'Žádná stará data k pročištění.'
  });
}
