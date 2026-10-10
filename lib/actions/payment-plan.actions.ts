"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getPaymentPlans() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.paymentPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { dueDate: "asc" },
  });
}

export async function createPaymentPlan(data: {
  name: string;
  description?: string;
  amount: number;
  dueDate: Date;
  categoryId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await db.paymentPlan.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/payments");
  return { success: true, plan };
}

export async function updatePaymentPlan(
  id: string,
  data: {
    name: string;
    description?: string;
    amount: number;
    dueDate: Date;
    categoryId?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Payment plan tidak ditemukan");
  if (existing.isPaid) throw new Error("Pembayaran yang sudah lunas tidak dapat diedit");

  await db.paymentPlan.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/payments");
  return { success: true };
}

export async function deletePaymentPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Payment plan tidak ditemukan");

  await db.paymentPlan.delete({ where: { id } });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function payPaymentPlan(
  id: string,
  data: { note?: string; paidAt?: Date }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!plan) throw new Error("Payment plan tidak ditemukan");
  if (plan.isPaid) throw new Error("Pembayaran ini sudah lunas");

  // Cari kategori EXPENSE yang sesuai (pakai categoryId dari plan, atau fallback)
  let categoryId = plan.categoryId;
  if (!categoryId) {
    // Cari kategori "Tagihan" atau "Pengeluaran Rutin" milik user, atau pakai kategori EXPENSE apa saja
    const fallbackCategory = await db.category.findFirst({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        name: { in: ["Tagihan", "Sehari-hari", "Jajan"] },
      },
    });
    // Jika tidak ada, cari kategori EXPENSE apapun
    const anyExpense =
      fallbackCategory ??
      (await db.category.findFirst({
        where: { userId: session.user.id, type: "EXPENSE" },
      }));
    if (!anyExpense) throw new Error("Tidak ada kategori pengeluaran tersedia");
    categoryId = anyExpense.id;
  }

  const paidDate = data.paidAt ?? new Date();

  // Buat transaksi EXPENSE otomatis agar saldo berkurang
  const transaction = await db.transaction.create({
    data: {
      userId: session.user.id,
      categoryId,
      amount: plan.amount,
      type: "EXPENSE",
      date: paidDate,
      note: `Pembayaran: ${plan.name}${data.note ? ` — ${data.note}` : ""}`,
    },
  });

  // Tandai payment plan sebagai lunas
  await db.paymentPlan.update({
    where: { id },
    data: {
      isPaid: true,
      paidAt: paidDate,
      paidNote: data.note ?? null,
      transactionId: transaction.id,
    },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function unpayPaymentPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!plan) throw new Error("Payment plan tidak ditemukan");
  if (!plan.isPaid) throw new Error("Pembayaran ini belum lunas");

  // Hapus transaksi yang terkait (agar saldo kembali)
  if (plan.transactionId) {
    await db.transaction.deleteMany({
      where: { id: plan.transactionId, userId: session.user.id },
    });
  }

  // Reset status bayar
  await db.paymentPlan.update({
    where: { id },
    data: {
      isPaid: false,
      paidAt: null,
      paidNote: null,
      transactionId: null,
    },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}
