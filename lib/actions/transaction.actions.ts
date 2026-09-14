"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().finite().positive("Nominal harus lebih dari nol"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.coerce.date(),
  categoryId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
  savingGoalId: z.string().uuid().optional(),
});

export async function getTransactions(month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Hitung rentang tanggal (dari hari pertama bulan tsb sampai hari terakhir)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function createTransaction(data: {
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  categoryId: string;
  note?: string;
  savingGoalId?: string; // Khusus untuk kategori Tabungan
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = transactionSchema.parse(data);
  const { savingGoalId, ...transactionData } = input;
  const category = await db.category.findFirst({
    where: { id: input.categoryId, userId: session.user.id, type: input.type },
  });
  if (!category) throw new Error("Kategori tidak ditemukan atau tipenya tidak sesuai");

  // Buat transaksi baru
  const transaction = await db.transaction.create({
    data: {
      amount: transactionData.amount,
      type: transactionData.type,
      date: transactionData.date,
      category: { connect: { id: transactionData.categoryId } },
      user: { connect: { id: session.user.id } },
      ...(transactionData.note ? { note: transactionData.note } : {}),
    },
  });

  // Logika khusus: Jika ini transaksi menabung, update progress target tabungan
  if (input.type === "EXPENSE" && savingGoalId) {
    const goal = await db.savingGoal.findUnique({ where: { id: savingGoalId } });
    if (goal && goal.userId === session.user.id) {
      const newAmount = goal.currentAmount + input.amount;
      await db.savingGoal.update({
        where: { id: savingGoalId },
        data: {
          currentAmount: newAmount,
          status: newAmount >= goal.targetAmount ? "ACHIEVED" : "ONGOING",
        },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/savings");
  revalidatePath("/dashboard/budgets");
  return { success: true, transaction };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transaction = await db.transaction.findFirst({ where: { id, userId: session.user.id } });
  if (!transaction) throw new Error("Transaksi tidak ditemukan");
  await db.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function updateTransaction(
  id: string,
  data: {
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: Date;
    categoryId: string;
    note?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = transactionSchema.omit({ savingGoalId: true }).parse(data);
  const existing = await db.transaction.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) throw new Error("Transaksi tidak ditemukan");
  const category = await db.category.findFirst({
    where: { id: input.categoryId, userId: session.user.id, type: input.type },
  });
  if (!category) throw new Error("Kategori tidak ditemukan atau tipenya tidak sesuai");

  await db.transaction.update({
    where: { id },
    data: input,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}
