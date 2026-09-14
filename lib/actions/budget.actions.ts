"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().finite().min(0, "Alokasi tidak boleh negatif"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export async function upsertBudget(data: z.infer<typeof budgetSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = budgetSchema.parse(data);

  const category = await db.category.findFirst({
    where: {
      id: input.categoryId,
      userId: session.user.id,
      type: "EXPENSE",
    },
  });
  if (!category) throw new Error("Kategori pengeluaran tidak ditemukan");

  await db.budget.upsert({
    where: { userId_categoryId_month_year: { userId: session.user.id, categoryId: input.categoryId, month: input.month, year: input.year } },
    update: { amount: input.amount },
    create: {
      amount: input.amount,
      month: input.month,
      year: input.year,
      user: { connect: { id: session.user.id } },
      category: { connect: { id: input.categoryId } },
    },
  });

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBudgetsProgress(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const filter = z.object({ month: z.number().int().min(1).max(12), year: z.number().int().min(2000).max(2100) }).parse({ month, year });

  // Ambil semua kategori pengeluaran
  const expenseCategories = await db.category.findMany({
    where: {
      userId: session.user.id,
      type: "EXPENSE",
    },
    orderBy: { name: "asc" },
  });

  // Ambil budget yang disetel untuk bulan ini
  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
      month: filter.month,
      year: filter.year,
    },
  });

  // Ambil total pengeluaran per kategori untuk bulan ini
  const startDate = new Date(filter.year, filter.month - 1, 1);
  const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);

  const transactions = await db.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Gabungkan datanya
  const progress = expenseCategories.map((cat) => {
    const budgetObj = budgets.find((b) => b.categoryId === cat.id);
    const txObj = transactions.find((t) => t.categoryId === cat.id);

    const allocatedAmount = budgetObj?.amount || 0;
    const spentAmount = txObj?._sum.amount || 0;
    const rawPercentage = allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : spentAmount > 0 ? 100 : 0;
    const percentage = Math.min(rawPercentage, 100);
    const remainingAmount = allocatedAmount - spentAmount;
    const status: "NORMAL" | "WARNING" | "OVER" = allocatedAmount === 0 || spentAmount >= allocatedAmount ? "OVER" : rawPercentage >= 80 ? "WARNING" : "NORMAL";

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      allocatedAmount,
      spentAmount,
      remainingAmount,
      percentage,
      rawPercentage,
      status,
    };
  });

  // Urutkan: yang persentasenya paling besar di atas
  return progress.sort((a, b) => b.percentage - a.percentage);
}
