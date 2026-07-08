import { NextResponse } from 'next/server';
import { addThreat } from '@/lib/db';
import { sendThreatAlert } from '@/lib/email';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    
    const reportSchema = z.object({
      url: z.string().url().max(500),
      description: z.string().max(2000).optional().or(z.literal('')),
    });

    const parsed = reportSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data', details: parsed.error.issues }, { status: 400 });
    }

    const { url, description } = parsed.data;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Zkontrolujeme Rate Limit formuláře
    const rl = await checkApiRateLimit(ip, 10, 60 * 1000); // Max 10 reportů za minutu per IP
    if (!rl.success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    // Simulate network delay and "AI scanning"
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Přidání do DB
    const threat = await addThreat({
      domain: url,
      ip,
      status: 'PENDING',
      source: 'MANUAL_REPORT',
      description: description || 'Nahlášeno uživatelem přes formulář.'
    });

    console.log(`[Trust API - BE] Přijato hlášení o podvodu na URL: ${url}`);
    if (description) {
      console.log(`[Trust API - BE] Doplňující informace: ${description}`);
    }

    // Odeslat emailový alert asynchronně (neblokujeme request)
    sendThreatAlert(threat);

    return NextResponse.json({ 
      success: true, 
      message: 'Hlášení bylo úspěšně přijato a předáno AI k analýze.',
      threatId: threat.id
    });
  } catch {
    return NextResponse.json({ error: 'Chyba při zpracování požadavku' }, { status: 500 });
  }
}
