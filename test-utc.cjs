process.env.TZ = 'UTC';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const userId = '5f30f0df-d4fc-4647-aea6-34fdc3bc7197';
  const month = 10;
  const year = 2026;

  console.log('TZ in script:', process.env.TZ);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  console.log('startDate (UTC):', startDate.toISOString());
  console.log('endDate (UTC):', endDate.toISOString());

  const txs = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate }
    },
    include: { category: true }
  });

  console.log(`Month 10 count when server is UTC:`, txs.length);
  for (const t of txs) {
    console.log(t.id, t.date.toISOString(), t.amount, t.category?.name);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
