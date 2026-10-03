const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  console.log('USERS:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));

  for (const u of users) {
    const txs = await prisma.transaction.findMany({
      where: { userId: u.id },
      orderBy: { date: 'desc' },
      include: { category: true }
    });
    console.log(`\nUser: ${u.name} (${u.email}) - Total TX: ${txs.length}`);
    for (const t of txs) {
      console.log(`  - [${t.type}] ${t.date.toISOString()} | local: ${t.date.toLocaleDateString('id-ID')} | amount: ${t.amount} | category: ${t.category?.name}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
