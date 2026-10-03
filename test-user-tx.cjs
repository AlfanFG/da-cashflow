const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const userId = '5f30f0df-d4fc-4647-aea6-34fdc3bc7197';
  
  // Test for month 10 (October)
  for (const m of [9, 10]) {
    const startDate = new Date(2026, m - 1, 1);
    const endDate = new Date(2026, m, 0, 23, 59, 59, 999);

    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { category: true }
    });

    console.log(`Month ${m} count:`, txs.length);
    for (const t of txs) {
      console.log(`  [${t.type}] ${t.date.toISOString()} | Rp ${t.amount} | ${t.category?.name}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
