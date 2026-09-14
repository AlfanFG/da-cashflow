"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardSummary(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { totalBalance: 0, totalIncomeThisMonth: 0, totalExpenseThisMonth: 0 };
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

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

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

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

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const daysInMonth = endDate.getDate();

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
    const day = tx.date.getDate() - 1; // 0-indexed untuk array
    if (tx.type === "INCOME") trend[day].income += tx.amount;
    else trend[day].expense += tx.amount;
  });

  return trend;
}
