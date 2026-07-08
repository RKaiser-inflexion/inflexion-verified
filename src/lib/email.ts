import { Threat } from './db';
import * as Sentry from '@sentry/nextjs';

export async function sendThreatAlert(threat: Threat) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: RESEND_API_KEY environment variable is missing in production!');
    }
    console.warn('⚠️ [Email] RESEND_API_KEY chybí v .env.local, email nebyl odeslán.');
    return false;
  }

  const isBearTrap = threat.source === 'BEAR_TRAP';
  const subject = isBearTrap 
    ? `🚨 URGENTNÍ: Bear Trap zablokoval útok z domény ${threat.domain}`
    : `⚠️ NOVÉ HLÁŠENÍ: Podezřelá doména ${threat.domain}`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${isBearTrap ? '#D9005B' : '#f59e0b'}; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${isBearTrap ? '🚨 Útok Zablokován' : '⚠️ Nové Nahlášení'}</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #111827;">
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Náš bezpečnostní systém Inflexion SecOps zaznamenal nový incident.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;"><strong>Zdroj:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">
              ${isBearTrap ? '🐻 Past na Medvěda (Automaticky zablokováno)' : '👤 Manuální hlášení od uživatele (Čeká na ověření)'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Doména:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #D9005B;">${threat.domain}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>IP Útočníka:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 14px;">${threat.ip}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Čas (UTC):</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${threat.timestamp}</td>
          </tr>
          ${threat.description ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Popis:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-style: italic;">"${threat.description}"</td>
          </tr>
          ` : ''}
        </table>

        <div style="text-align: center;">
          <a href="http://localhost:3000/admin" style="display: inline-block; background-color: #111827; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
            Otevřít Inflexion SecOps Admin
          </a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
        Tato zpráva byla automaticky vygenerována bezpečnostním systémem Inflexion Trust API.
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Inflexion SecOps <onboarding@resend.dev>', // Používáme výchozí testovací doménu z Resendu
        to: 'richard@inflexion.cz',
        subject: subject,
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ [Email] Selhalo odeslání přes Resend API:', errorData);
      Sentry.captureException(new Error(`Resend API selhalo: ${JSON.stringify(errorData)}`));
      return false;
    }

    console.log('✅ [Email] Alert úspěšně odeslán na richard@inflexion.cz');
    return true;
  } catch (error) {
    console.error('❌ [Email] Závažná chyba při odesílání:', error);
    Sentry.captureException(error);
    return false;
  }
}
