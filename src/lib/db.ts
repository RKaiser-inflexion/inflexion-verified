import fs from 'fs';
import path from 'path';

// Získání absolutní cesty k datům
const dataDir = path.join(process.cwd(), 'data');
const advisorsFile = path.join(dataDir, 'advisors.json');
const threatsFile = path.join(dataDir, 'threats.json');
const analyticsFile = path.join(dataDir, 'analytics.json');

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
  status: 'BLOCKED' | 'PENDING' | 'RESOLVED';
  source: 'BEAR_TRAP' | 'MANUAL_REPORT';
  description?: string;
}

export function getAdvisors(): Record<string, Advisor> {
  try {
    const data = fs.readFileSync(advisorsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading advisors.json:', error);
    return {};
  }
}

export function addAdvisor(domain: string, advisor: Advisor) {
  const advisors = getAdvisors();
  advisors[domain] = advisor;
  fs.writeFileSync(advisorsFile, JSON.stringify(advisors, null, 2));
}

export function removeAdvisor(domain: string) {
  const advisors = getAdvisors();
  if (advisors[domain]) {
    delete advisors[domain];
    fs.writeFileSync(advisorsFile, JSON.stringify(advisors, null, 2));
    return true;
  }
  return false;
}

export function getThreats(): Threat[] {
  try {
    const data = fs.readFileSync(threatsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading threats.json:', error);
    return [];
  }
}

export function addThreat(threat: Omit<Threat, 'id' | 'timestamp'>) {
  const threats = getThreats();
  const newThreat: Threat = {
    ...threat,
    id: `TR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    timestamp: new Date().toISOString()
  };
  // Dáme nejnovější nahoru
  threats.unshift(newThreat);
  fs.writeFileSync(threatsFile, JSON.stringify(threats, null, 2));
  return newThreat;
}

export function updateThreatStatus(id: string, status: Threat['status']) {
  const threats = getThreats();
  const index = threats.findIndex(t => t.id === id);
  if (index !== -1) {
    threats[index].status = status;
    fs.writeFileSync(threatsFile, JSON.stringify(threats, null, 2));
  }
}

export function cleanupOldThreats() {
  const threats = getThreats();
  const now = new Date();
  
  // 30 days in ms
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  
  let modified = false;

  const cleanedThreats = threats.map(t => {
    const threatDate = new Date(t.timestamp);
    const age = now.getTime() - threatDate.getTime();
    
    // Anonymize IP and description if it's older than 30 days and not ACTIVE
    if (age > THIRTY_DAYS_MS && t.status !== 'ACTIVE' && t.ip !== '***ANONYMIZED***') {
      modified = true;
      return {
        ...t,
        ip: '***ANONYMIZED***',
        description: t.description ? '***DELETED (GDPR)***' : undefined,
      };
    }
    return t;
  });

  if (modified) {
    fs.writeFileSync(threatsFile, JSON.stringify(cleanedThreats, null, 2));
    console.log('[GDPR] Úspěšně smazána PII data ze starých záznamů hrozeb.');
  }
  
  return modified;
}

// Kvůli zpětné kompatibilitě (např. v page.tsx kde to taháme staticky)
export const ADVISORS_DB = getAdvisors();

export function getAnalytics(): Record<string, number> {
  try {
    if (!fs.existsSync(analyticsFile)) {
      fs.writeFileSync(analyticsFile, JSON.stringify({}));
      return {};
    }
    const data = fs.readFileSync(analyticsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics.json:', error);
    return {};
  }
}

export function logApiCall() {
  const analytics = getAnalytics();
  const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
  
  if (analytics[today]) {
    analytics[today]++;
  } else {
    analytics[today] = 1;
  }
  
  fs.writeFileSync(analyticsFile, JSON.stringify(analytics, null, 2));
}
