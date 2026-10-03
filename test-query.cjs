const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const month = 10;
  const year = 2026;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  console.log('month:', month, 'year:', year);
  console.log('startDate:', startDate.toISOString(), 'local:', startDate.toString());
  console.log('endDate:', endDate.toISOString(), 'local:', endDate.toString());

  const txs = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { category: true }
  });

  console.log('Found with current logic (month 10):', txs.length);
  for (const t of txs) {
    console.log(t.id, t.date.toISOString(), t.amount, t.category?.name);
  }

  // What about month 9?
  const s9 = new Date(2026, 8, 1);
  const e9 = new Date(2026, 9, 0, 23, 59, 59, 999);
  console.log('\ns9:', s9.toISOString(), 'e9:', e9.toISOString());
  const txs9 = await prisma.transaction.findMany({
    where: {
      date: {
        gte: s9,
        lte: e9,
      },
    },
  });
  console.log('Found with month 9:', txs9.length);
}

run().catch(console.error).finally(() => prisma.$disconnect());
