import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Začínám migraci dat z JSON souborů do Postgres...');
  const dataDir = path.join(process.cwd(), 'data');

  // 1. Migrace Advisors
  const advisorsFile = path.join(dataDir, 'advisors.json');
  if (fs.existsSync(advisorsFile)) {
    const advisorsData = JSON.parse(fs.readFileSync(advisorsFile, 'utf8'));
    let imported = 0;
    for (const [domain, adv] of Object.entries(advisorsData)) {
      const typedAdv = adv as any;
      await prisma.advisor.upsert({
        where: { domain },
        update: {},
        create: {
          domain,
          id: typedAdv.id,
          name: typedAdv.name,
          role: typedAdv.role,
          photoUrl: typedAdv.photoUrl,
          email: typedAdv.email,
          phone: typedAdv.phone,
          isDemo: typedAdv.isDemo || false,
        }
      });
      imported++;
    }
    console.log(`✅ Advisors: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Advisors: JSON soubor neexistuje, přeskakuji.');
  }

  // 2. Migrace Threats
  const threatsFile = path.join(dataDir, 'threats.json');
  if (fs.existsSync(threatsFile)) {
    const threatsData = JSON.parse(fs.readFileSync(threatsFile, 'utf8'));
    let imported = 0;
    for (const threat of threatsData) {
      await prisma.threat.upsert({
        where: { id: threat.id },
        update: {},
        create: {
          id: threat.id,
          domain: threat.domain,
          ip: threat.ip,
          timestamp: new Date(threat.timestamp),
          status: threat.status,
          source: threat.source,
          description: threat.description,
        }
      });
      imported++;
    }
    console.log(`✅ Threats: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Threats: JSON soubor neexistuje, přeskakuji.');
  }

  // 3. Migrace Analytics
  const analyticsFile = path.join(dataDir, 'analytics.json');
  if (fs.existsSync(analyticsFile)) {
    const analyticsData = JSON.parse(fs.readFileSync(analyticsFile, 'utf8'));
    let imported = 0;
    for (const [date, count] of Object.entries(analyticsData)) {
      await prisma.analytics.upsert({
        where: { date },
        update: {},
        create: {
          date,
          count: count as number,
        }
      });
      imported++;
    }
    console.log(`✅ Analytics: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Analytics: JSON soubor neexistuje, přeskakuji.');
  }

  // 4. Migrace Users
  const usersFile = path.join(dataDir, 'users.json');
  if (fs.existsSync(usersFile)) {
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    let imported = 0;
    for (const user of usersData) {
      const existingUser = await prisma.user.findUnique({ where: { username: user.username } });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            username: user.username,
            passwordHash: user.passwordHash,
            role: user.role,
            createdAt: new Date(user.createdAt),
          }
        });
        imported++;
      }
    }
    console.log(`✅ Users: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Users: JSON soubor neexistuje, přeskakuji.');
  }

  // 5. Migrace Audit Logs
  const auditFile = path.join(dataDir, 'audit_logs.json');
  if (fs.existsSync(auditFile)) {
    const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
    let imported = 0;
    for (const log of auditData) {
      await prisma.auditLog.upsert({
        where: { id: log.id },
        update: {},
        create: {
          id: log.id,
          timestamp: new Date(log.timestamp),
          type: log.type,
          ip: log.ip,
          username: log.username,
          details: log.details,
        }
      });
      imported++;
    }
    console.log(`✅ Audit Logs: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Audit Logs: JSON soubor neexistuje, přeskakuji.');
  }

  // 6. Migrace Rate Limits
  const rateLimitFile = path.join(dataDir, 'rate_limits.json');
  if (fs.existsSync(rateLimitFile)) {
    const rateLimitData = JSON.parse(fs.readFileSync(rateLimitFile, 'utf8'));
    let imported = 0;
    for (const [ip, limit] of Object.entries(rateLimitData)) {
      const typedLimit = limit as any;
      await prisma.rateLimit.upsert({
        where: { ip },
        update: {},
        create: {
          ip,
          attempts: typedLimit.attempts || 0,
          blockedUntil: typedLimit.blockedUntil ? new Date(typedLimit.blockedUntil) : null,
        }
      });
      imported++;
    }
    console.log(`✅ Rate Limits: ${imported} záznamů migrováno.`);
  } else {
    console.log('ℹ️  Rate Limits: JSON soubor neexistuje, přeskakuji.');
  }

  console.log('🎉 Migrace úspěšně dokončena!');
}

main()
  .catch((e) => {
    console.error('❌ Chyba při migraci:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
