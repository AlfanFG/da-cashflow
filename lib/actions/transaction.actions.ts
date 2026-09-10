"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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

  // Buat transaksi baru
  const transaction = await db.transaction.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  // Logika khusus: Jika ini transaksi menabung, update progress target tabungan
  if (data.type === "EXPENSE" && data.savingGoalId) {
    const goal = await db.savingGoal.findUnique({ where: { id: data.savingGoalId } });
    if (goal && goal.userId === session.user.id) {
      const newAmount = goal.currentAmount + data.amount;
      await db.savingGoal.update({
        where: { id: data.savingGoalId },
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
  return { success: true, transaction };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.transaction.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
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

  await db.transaction.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  return { success: true };
}
