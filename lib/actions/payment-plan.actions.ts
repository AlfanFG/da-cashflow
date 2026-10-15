"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getPaymentPlans() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.paymentPlan.findMany({
    where: { userId: session.user.id },
    include: {
      payments: {
        orderBy: { date: "desc" },
      },
    },
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
      paidAmount: 0,
      isPaid: false,
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
  if (existing.isPaid)
    throw new Error("Pembayaran yang sudah lunas tidak dapat diedit");

  const newIsPaid = (existing.paidAmount ?? 0) >= data.amount;

  await db.paymentPlan.update({
    where: { id },
    data: {
      ...data,
      isPaid: newIsPaid,
    },
  });

  revalidatePath("/dashboard/payments");
  return { success: true };
}

export async function deletePaymentPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
    include: { payments: true },
  });
  if (!plan) throw new Error("Payment plan tidak ditemukan");

  // Hapus semua transaksi pengeluaran terkait dari Cashflow agar saldo sinkron
  const txIds = plan.payments
    .map((p) => p.transactionId)
    .filter((tid): tid is string => Boolean(tid));
  if (plan.transactionId && !txIds.includes(plan.transactionId)) {
    txIds.push(plan.transactionId);
  }

  if (txIds.length > 0) {
    await db.transaction.deleteMany({
      where: { id: { in: txIds }, userId: session.user.id },
    });
  }

  await db.paymentPlan.delete({ where: { id } });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function payPaymentPlan(
  id: string,
  data: { amount: number; note?: string; paidAt?: Date }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!data.amount || data.amount <= 0) {
    throw new Error("Nominal pembayaran harus lebih dari nol");
  }

  const plan = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!plan) throw new Error("Payment plan tidak ditemukan");
  if (plan.isPaid) throw new Error("Pembayaran ini sudah lunas");

  const currentPaid = plan.paidAmount ?? 0;
  const remaining = Math.max(0, plan.amount - currentPaid);
  const paymentAmount = Math.min(data.amount, remaining > 0 ? remaining : data.amount);

  // Cari kategori EXPENSE yang sesuai (pakai categoryId dari plan, atau fallback)
  let categoryId = plan.categoryId;
  if (!categoryId) {
    const fallbackCategory = await db.category.findFirst({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        name: { in: ["Tagihan", "Sehari-hari", "Jajan"] },
      },
    });
    const anyExpense =
      fallbackCategory ??
      (await db.category.findFirst({
        where: { userId: session.user.id, type: "EXPENSE" },
      }));
    if (!anyExpense) throw new Error("Tidak ada kategori pengeluaran tersedia");
    categoryId = anyExpense.id;
  }

  const paidDate = data.paidAt ?? new Date();
  const isFinalPayment = currentPaid + paymentAmount >= plan.amount;
  const paymentPrefix = isFinalPayment && currentPaid === 0 ? "Pembayaran" : "Cicilan Pembayaran";

  // 1. Buat transaksi EXPENSE otomatis agar Saldo Utama langsung berkurang
  const transaction = await db.transaction.create({
    data: {
      userId: session.user.id,
      categoryId,
      amount: paymentAmount,
      type: "EXPENSE",
      date: paidDate,
      note: `${paymentPrefix}: ${plan.name}${data.note ? ` — ${data.note}` : ""}`,
    },
  });

  // 2. Buat PaymentRecord untuk menyimpan riwayat setor/cicil
  await db.paymentRecord.create({
    data: {
      paymentPlanId: plan.id,
      amount: paymentAmount,
      date: paidDate,
      note: data.note ?? null,
      transactionId: transaction.id,
    },
  });

  // 3. Update nominal terbayar dan status lunas
  const newPaidAmount = currentPaid + paymentAmount;
  const isPaid = newPaidAmount >= plan.amount;

  await db.paymentPlan.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      isPaid,
      paidAt: isPaid ? paidDate : plan.paidAt,
      paidNote: data.note ?? plan.paidNote,
      transactionId: transaction.id,
    },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true, isPaid, newPaidAmount };
}

export async function unpayPaymentPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await db.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
    include: { payments: true },
  });
  if (!plan) throw new Error("Payment plan tidak ditemukan");

  // Hapus semua transaksi pembayaran terkait agar saldo kembali utuh
  const txIds = plan.payments
    .map((p) => p.transactionId)
    .filter((tid): tid is string => Boolean(tid));
  if (plan.transactionId && !txIds.includes(plan.transactionId)) {
    txIds.push(plan.transactionId);
  }

  if (txIds.length > 0) {
    await db.transaction.deleteMany({
      where: { id: { in: txIds }, userId: session.user.id },
    });
  }

  // Hapus semua riwayat payment records
  await db.paymentRecord.deleteMany({
    where: { paymentPlanId: id },
  });

  // Reset status dan nominal terbayar
  await db.paymentPlan.update({
    where: { id },
    data: {
      paidAmount: 0,
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

export async function deletePaymentRecord(recordId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const record = await db.paymentRecord.findUnique({
    where: { id: recordId },
    include: { paymentPlan: true },
  });
  if (!record || record.paymentPlan.userId !== session.user.id) {
    throw new Error("Catatan pembayaran tidak ditemukan");
  }

  // Hapus transaksi terkait di Cashflow agar saldo dikembalikan
  if (record.transactionId) {
    await db.transaction.deleteMany({
      where: { id: record.transactionId, userId: session.user.id },
    });
  }

  const plan = record.paymentPlan;
  const newPaidAmount = Math.max(0, (plan.paidAmount ?? 0) - record.amount);
  const isPaid = newPaidAmount >= plan.amount;

  await db.paymentRecord.delete({ where: { id: recordId } });

  await db.paymentPlan.update({
    where: { id: plan.id },
    data: {
      paidAmount: newPaidAmount,
      isPaid,
    },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}
