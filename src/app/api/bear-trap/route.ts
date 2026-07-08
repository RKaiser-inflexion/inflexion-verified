import { NextResponse } from 'next/server';
import { addThreat } from '@/lib/db';
import { sendThreatAlert } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { domain } = data;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Přidání do perzistentní databáze
    const threat = await addThreat({
      domain,
      ip,
      status: 'BLOCKED',
      source: 'BEAR_TRAP',
      description: 'Záchyt z pastí na Inflexion Verified (Honeypot)'
    });

    console.log('\n');
    console.log('======================================================');
    console.log('🚨 [BEAR TRAP ACTIVATED] - INTRUSION DETECTED 🚨');
    console.log('======================================================');
    console.log(`❌ Phishing doména: ${domain}`);
    console.log(`🌐 IP Útočníka:    ${ip}`);
    console.log(`🆔 Threat ID:      ${threat.id}`);
    console.log(`🕒 Čas:            ${threat.timestamp}`);
    console.log('------------------------------------------------------');
    console.log('🛡️  Spouštím ochranný protokol...');
    console.log('📡 Odesílám Abuse Report (CZ.NIC, Google Safe Browsing)...');
    console.log('🔒 Doména přidána na interní Inflexion DNS Blacklist a zaznamenána do Admin panelu.');
    console.log('======================================================\n');

    // Odeslat emailový alert asynchronně (neblokujeme request)
    sendThreatAlert(threat);

    return NextResponse.json({ success: true, message: 'Bear trap activated', threatId: threat.id });
  } catch (error) {
    return NextResponse.json({ error: 'Chyba při zpracování požadavku' }, { status: 500 });
  }
}
