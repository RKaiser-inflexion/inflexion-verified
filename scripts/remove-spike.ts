import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Odstranuji testovaci data...");
  const result = await prisma.analytics.deleteMany({
    where: {
      count: 100
    }
  });
  console.log(`Odstraneno zaznamu: ${result.count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
