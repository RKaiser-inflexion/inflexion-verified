import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');
const auditFile = path.join(dataDir, 'audit_logs.json');
const rateLimitFile = path.join(dataDir, 'rate_limits.json');

// Ujistíme se, že datový adresář existuje
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export interface User {
  username: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'IP_BLOCKED' | 'USER_CREATED';
  ip: string;
  username?: string;
  details?: string;
}

export interface RateLimitData {
  attempts: number;
  blockedUntil: number | null;
}

// Helpery pro čtení/zápis JSON souborů (s default prázdným polem/objektem při chybě)
function readJson<T>(file: string, defaultData: T): T {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return defaultData;
  }
}

function writeJson(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
  }
}

// --- USERS ---
export function getUsers(): User[] {
  return readJson<User[]>(usersFile, []);
}

export function addUser(user: Omit<User, 'passwordHash' | 'createdAt'>, passwordPlain: string) {
  const users = getUsers();
  if (users.find(u => u.username === user.username)) {
    throw new Error('Uživatel již existuje');
  }
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);
  const newUser: User = {
    ...user,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJson(usersFile, users);
  
  logAudit({
    type: 'USER_CREATED',
    ip: '127.0.0.1',
    username: user.username,
    details: `Vytvořen uživatel ${user.username} s rolí ${user.role}`
  });
  
  return newUser;
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username === username);
}

// --- AUDIT LOGS ---
export function getAuditLogs(): AuditLog[] {
  return readJson<AuditLog[]>(auditFile, []);
}

export function logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.unshift(newLog); // Přidat na začátek (nejnovější první)
  // Omezíme historii na posledních 1000 záznamů
  if (logs.length > 1000) logs.length = 1000;
  writeJson(auditFile, logs);
}

// --- RATE LIMITS ---
export function checkRateLimit(ip: string): { allowed: boolean; waitTimeMinutes?: number } {
  const limits = readJson<Record<string, RateLimitData>>(rateLimitFile, {});
  const now = Date.now();
  const record = limits[ip] || { attempts: 0, blockedUntil: null };

  if (record.blockedUntil && record.blockedUntil > now) {
    const waitTimeMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    return { allowed: false, waitTimeMinutes };
  }

  // Pokud vypršel ban, resetujeme attempts
  if (record.blockedUntil && record.blockedUntil <= now) {
    record.attempts = 0;
    record.blockedUntil = null;
    limits[ip] = record;
    writeJson(rateLimitFile, limits);
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string, usernameAttempt: string) {
  const limits = readJson<Record<string, RateLimitData>>(rateLimitFile, {});
  const now = Date.now();
  const record = limits[ip] || { attempts: 0, blockedUntil: null };

  record.attempts += 1;

  if (record.attempts >= 5) {
    // Ban na 1 hodinu
    record.blockedUntil = now + 60 * 60 * 1000;
    logAudit({
      type: 'IP_BLOCKED',
      ip,
      username: usernameAttempt,
      details: 'IP adresa byla zablokována na 1 hodinu z důvodu 5 neúspěšných pokusů.'
    });
  } else {
    logAudit({
      type: 'LOGIN_FAILED',
      ip,
      username: usernameAttempt,
      details: `Neplatné přihlašovací údaje (pokus ${record.attempts}/5)`
    });
  }

  limits[ip] = record;
  writeJson(rateLimitFile, limits);
}

export function recordSuccessfulLogin(ip: string, username: string) {
  const limits = readJson<Record<string, RateLimitData>>(rateLimitFile, {});
  
  // Reset pokusů po úspěšném přihlášení
  if (limits[ip]) {
    delete limits[ip];
    writeJson(rateLimitFile, limits);
  }

  logAudit({
    type: 'LOGIN_SUCCESS',
    ip,
    username,
    details: 'Úspěšné přihlášení'
  });
}

// --- MIGRATION UTILITY ---
// Volá se jednorázově pro naimportování usera z ENV
export function initializeAdminFromEnv() {
  const users = getUsers();
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  
  if (users.length === 0 && envUser && envPass) {
    console.log('🔄 Spouštím úvodní migraci uživatele z .env.local...');
    addUser({ username: envUser, role: 'superadmin' }, envPass);
    console.log('✅ Uživatel úspěšně importován jako Superadmin a zašifrován do users.json.');
  }
}
