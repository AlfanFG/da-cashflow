"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

// Helper: Hitung batas tanggal awal & akhir bulan berdasarkan timezone WIB (UTC+7)
function getMonthBoundsWIB(month: number, year: number) {
  // Start: Tanggal 1 bulan ini jam 00:00:00 WIB = UTC - 7 jam
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 7 * 3600 * 1000);
  // End: Tanggal 1 bulan depan jam 00:00:00 WIB dikurangi 1ms
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0) - 7 * 3600 * 1000 - 1);
  return { startDate, endDate };
}

export async function getDashboardSummary(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { totalBalance: 0, totalIncomeThisMonth: 0, totalExpenseThisMonth: 0 };
  }

  const { startDate, endDate } = getMonthBoundsWIB(month, year);

  // Ambil semua transaksi (unlimited) untuk saldo total
  const allTransactions = await db.transaction.findMany({
    where: { userId: session.user.id },
    select: { amount: true, type: true },
  });

  let totalBalance = 0;
  allTransactions.forEach((tx) => {
    if (tx.type === "INCOME") totalBalance += tx.amount;
    else totalBalance -= tx.amount;
  });

  // Ambil transaksi hanya di bulan ini
  const thisMonthTransactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    select: { amount: true, type: true },
  });

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;

  thisMonthTransactions.forEach((tx) => {
    if (tx.type === "INCOME") totalIncomeThisMonth += tx.amount;
    else totalExpenseThisMonth += tx.amount;
  });

  return { totalBalance, totalIncomeThisMonth, totalExpenseThisMonth };
}

export async function getExpenseBreakdown(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { startDate, endDate } = getMonthBoundsWIB(month, year);

  const expenses = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
  });

  const breakdown: Record<string, { categoryName: string; amount: number; color: string }> = {};

  expenses.forEach((tx) => {
    const catId = tx.categoryId;
    if (!breakdown[catId]) {
      breakdown[catId] = {
        categoryName: tx.category.name,
        amount: 0,
        color: tx.category.color,
      };
    }
    breakdown[catId].amount += tx.amount;
  });

  return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
}

export async function getCashflowTrend(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { startDate, endDate } = getMonthBoundsWIB(month, year);
  const daysInMonth = new Date(year, month, 0).getDate();

  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    select: { amount: true, type: true, date: true },
  });

  const trend = Array.from({ length: daysInMonth }, (_, i) => ({
    date: (i + 1).toString(),
    income: 0,
    expense: 0,
  }));

  transactions.forEach((tx) => {
    // Convert UTC timestamp ke WIB dengan menambahkan 7 jam
    const wibDate = new Date(tx.date.getTime() + 7 * 3600 * 1000);
    const day = wibDate.getUTCDate() - 1; // 0-indexed untuk array
    if (day >= 0 && day < daysInMonth) {
      if (tx.type === "INCOME") trend[day].income += tx.amount;
      else trend[day].expense += tx.amount;
    }
  });

  return trend;
}
