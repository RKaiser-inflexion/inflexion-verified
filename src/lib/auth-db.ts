import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
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
  username?: string | null;
  details?: string | null;
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users.map(u => ({
    ...u,
    role: u.role as User['role'],
    createdAt: u.createdAt.toISOString()
  }));
}

export async function addUser(user: Omit<User, 'id' | 'passwordHash' | 'createdAt'>, passwordPlain: string) {
  const existingUser = await prisma.user.findUnique({ where: { username: user.username } });
  if (existingUser) {
    throw new Error('Uživatel již existuje');
  }
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);
  const newUser = await prisma.user.create({
    data: {
      username: user.username,
      passwordHash,
      role: user.role,
    }
  });

  await logAudit({
    type: 'USER_CREATED',
    ip: '127.0.0.1',
    username: user.username,
    details: `Vytvořen uživatel ${user.username} s rolí ${user.role}`
  });

  return {
    ...newUser,
    role: newUser.role as User['role'],
    createdAt: newUser.createdAt.toISOString()
  };
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  return {
    ...user,
    role: user.role as User['role'],
    createdAt: user.createdAt.toISOString()
  };
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 1000
  });
  return logs.map(l => ({
    ...l,
    type: l.type as AuditLog['type'],
    timestamp: l.timestamp.toISOString()
  }));
}

export async function logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
  await prisma.auditLog.create({
    data: {
      type: entry.type,
      ip: entry.ip,
      username: entry.username,
      details: entry.details
    }
  });
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; waitTimeMinutes?: number }> {
  const record = await prisma.rateLimit.findUnique({ where: { ip } });
  if (!record) return { allowed: true };

  const now = new Date();
  if (record.blockedUntil && record.blockedUntil > now) {
    const waitTimeMinutes = Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 60000);
    return { allowed: false, waitTimeMinutes };
  }

  if (record.blockedUntil && record.blockedUntil <= now) {
    await prisma.rateLimit.update({
      where: { ip },
      data: { attempts: 0, blockedUntil: null }
    });
  }

  return { allowed: true };
}

export async function recordFailedLogin(ip: string, usernameAttempt: string) {
  const record = await prisma.rateLimit.upsert({
    where: { ip },
    update: { attempts: { increment: 1 } },
    create: { ip, attempts: 1 }
  });

  if (record.attempts >= 5) {
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + 1);
    
    await prisma.rateLimit.update({
      where: { ip },
      data: { blockedUntil }
    });

    await logAudit({
      type: 'IP_BLOCKED',
      ip,
      username: usernameAttempt,
      details: 'IP adresa byla zablokována na 1 hodinu z důvodu 5 neúspěšných pokusů.'
    });
  } else {
    await logAudit({
      type: 'LOGIN_FAILED',
      ip,
      username: usernameAttempt,
      details: `Neplatné přihlašovací údaje (pokus ${record.attempts}/5)`
    });
  }
}

export async function recordSuccessfulLogin(ip: string, username: string) {
  try {
    await prisma.rateLimit.delete({ where: { ip } });
  } catch (e) {
    // ignorujeme pokud neexistuje
  }

  await logAudit({
    type: 'LOGIN_SUCCESS',
    ip,
    username,
    details: 'Úspěšné přihlášení'
  });
}

export async function initializeAdminFromEnv() {
  const usersCount = await prisma.user.count();
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  
  if (usersCount === 0 && envUser && envPass) {
    console.log('🔄 Spouštím úvodní migraci uživatele z .env.local...');
    await addUser({ username: envUser, role: 'superadmin' }, envPass);
    console.log('✅ Uživatel úspěšně importován do Postgres.');
  }
}
