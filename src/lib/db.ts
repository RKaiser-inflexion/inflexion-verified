import { prisma } from './prisma';

export interface Advisor {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  email: string;
  phone: string;
  isDemo?: boolean;
}

export interface Threat {
  id: string;
  domain: string;
  ip: string;
  timestamp: string;
  status: 'BLOCKED' | 'PENDING' | 'RESOLVED' | 'ACTIVE';
  source: 'BEAR_TRAP' | 'MANUAL_REPORT';
  description?: string | null;
}

export async function getAdvisors(): Promise<Record<string, Advisor>> {
  const advisors = await prisma.advisor.findMany();
  const record: Record<string, Advisor> = {};
  for (const adv of advisors) {
    record[adv.domain] = {
      id: adv.id,
      name: adv.name,
      role: adv.role,
      photoUrl: adv.photoUrl,
      email: adv.email,
      phone: adv.phone,
      isDemo: adv.isDemo,
    };
  }
  return record;
}

export async function addAdvisor(domain: string, advisor: Advisor) {
  return await prisma.advisor.upsert({
    where: { domain },
    update: { ...advisor },
    create: { domain, ...advisor },
  });
}

export async function removeAdvisor(domain: string) {
  try {
    await prisma.advisor.delete({ where: { domain } });
    return true;
  } catch (e) {
    return false;
  }
}

export async function getThreats(): Promise<Threat[]> {
  const threats = await prisma.threat.findMany({ orderBy: { timestamp: 'desc' } });
  return threats.map((t) => ({
    ...t,
    timestamp: t.timestamp.toISOString(),
    status: t.status as Threat['status'],
    source: t.source as Threat['source'],
  }));
}

export async function addThreat(threat: Omit<Threat, 'id' | 'timestamp'>) {
  const id = `TR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const newThreat = await prisma.threat.create({
    data: {
      id,
      ...threat,
    },
  });
  return {
    ...newThreat,
    timestamp: newThreat.timestamp.toISOString(),
    status: newThreat.status as Threat['status'],
    source: newThreat.source as Threat['source'],
  };
}

export async function updateThreatStatus(id: string, status: Threat['status']) {
  await prisma.threat.update({
    where: { id },
    data: { status },
  });
}

export async function cleanupOldThreats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const threatsToAnonymize = await prisma.threat.findMany({
    where: {
      timestamp: { lt: thirtyDaysAgo },
      status: { not: 'ACTIVE' },
      ip: { not: '***ANONYMIZED***' },
    },
  });

  if (threatsToAnonymize.length > 0) {
    for (const t of threatsToAnonymize) {
      await prisma.threat.update({
        where: { id: t.id },
        data: {
          ip: '***ANONYMIZED***',
          description: t.description ? '***DELETED (GDPR)***' : null,
        },
      });
    }
    console.log(`[GDPR] Úspěšně smazána PII data z ${threatsToAnonymize.length} záznamů hrozeb.`);
    return true;
  }

  return false;
}

export async function getAnalytics(): Promise<Record<string, number>> {
  const analytics = await prisma.analytics.findMany();
  const record: Record<string, number> = {};
  for (const item of analytics) {
    record[item.date] = item.count;
  }
  return record;
}

export async function logApiCall() {
  const today = new Date().toISOString().split('T')[0];
  await prisma.analytics.upsert({
    where: { date: today },
    update: { count: { increment: 1 } },
    create: { date: today, count: 1 },
  });
}
