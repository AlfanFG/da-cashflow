"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSavingGoals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.savingGoal.findMany({
    where: { userId: session.user.id },
    include: { deposits: { orderBy: { date: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSavingGoal(data: { name: string; targetAmount: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await db.savingGoal.create({
    data: { ...data, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
  return { success: true, goal };
}

export async function updateSavingGoal(id: string, data: { name: string; targetAmount: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.savingGoal.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
  return { success: true };
}

export async function deleteSavingGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.savingGoal.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
  return { success: true };
}

export async function depositToSavingGoal(data: {
  savingGoalId: string;
  amount: number;
  note?: string;
  date: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await db.savingGoal.findUnique({
    where: { id: data.savingGoalId, userId: session.user.id },
  });
  if (!goal) throw new Error("Saving goal not found");

  // Cari kategori "Tabungan" milik user ini
  let tabunganCategory = await db.category.findFirst({
    where: { userId: session.user.id, name: "Tabungan", type: "EXPENSE" },
  });

  // Jika entah kenapa tidak ada, cari kategori EXPENSE apa saja sebagai fallback
  if (!tabunganCategory) {
    tabunganCategory = await db.category.findFirst({
      where: { userId: session.user.id, type: "EXPENSE" },
    });
  }

  // 1. Buat record deposit
  await db.savingDeposit.create({
    data: {
      amount: data.amount,
      note: data.note,
      date: data.date,
      savingGoalId: data.savingGoalId,
    },
  });

  // 2. Buat otomatis Transaksi Pengeluaran agar Saldo Utama berkurang
  if (tabunganCategory) {
    await db.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: tabunganCategory.id,
        amount: data.amount,
        type: "EXPENSE",
        date: data.date,
        note: `Setor tabungan: ${goal.name}${data.note ? ` - ${data.note}` : ""}`,
      },
    });
  }

  // 3. Update currentAmount dan status target tabungan
  const newAmount = goal.currentAmount + data.amount;
  await db.savingGoal.update({
    where: { id: data.savingGoalId },
    data: {
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount ? "ACHIEVED" : "ONGOING",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/savings");
  return { success: true };
}
