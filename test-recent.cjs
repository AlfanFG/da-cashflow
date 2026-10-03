const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { category: true, user: true }
  });
  console.log('Recent 10 created transactions:');
  for (const t of txs) {
    console.log(`id: ${t.id} | createdAt: ${t.createdAt.toISOString()} | date: ${t.date.toISOString()} | amount: ${t.amount} | user: ${t.user.name} (${t.user.email}) | category: ${t.category?.name}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
