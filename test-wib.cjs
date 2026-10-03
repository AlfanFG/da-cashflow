process.env.TZ = 'UTC';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getMonthRangeWIB(month, year) {
  // Start: Tanggal 1 bulan ini jam 00:00:00 WIB (UTC+7 -> kurangi 7 jam di UTC)
  const startUTC = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 7 * 3600 * 1000);
  
  // End: Tanggal 1 bulan depan jam 00:00:00 WIB dikurangi 1ms
  const endUTC = new Date(Date.UTC(year, month, 1, 0, 0, 0) - 7 * 3600 * 1000 - 1);

  return { startDate: startUTC, endDate: endUTC };
}

async function run() {
  const userId = '5f30f0df-d4fc-4647-aea6-34fdc3bc7197';
  const month = 10;
  const year = 2026;

  const { startDate, endDate } = getMonthRangeWIB(month, year);
  console.log('startDate (WIB in UTC):', startDate.toISOString());
  console.log('endDate (WIB in UTC):', endDate.toISOString());

  const txs = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate }
    },
    include: { category: true }
  });

  console.log(`Month 10 count WITH WIB RANGE (when server is UTC):`, txs.length);
  for (const t of txs) {
    console.log(`  [${t.type}] ${t.date.toISOString()} | Rp ${t.amount} | ${t.category?.name}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
