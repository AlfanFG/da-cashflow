"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CategoryType } from "@prisma/client";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(50),
  type: z.nativeEnum(CategoryType),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna kategori tidak valid"),
  icon: z.string().trim().max(8).optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

export async function getCategories(type?: CategoryType) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.category.findMany({
    where: { userId: session.user.id, ...(type ? { type } : {}) },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(data: CategoryInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = categorySchema.parse(data);

  const category = await db.category.create({
    data: {
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
      user: { connect: { id: session.user.id } },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  return { success: true, category };
}

export async function updateCategory(
  id: string,
  data: CategoryInput
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const input = categorySchema.parse(data);
  const existing = await db.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Kategori tidak ditemukan");

  if (existing.type !== input.type) {
    const transactionCount = await db.transaction.count({ where: { categoryId: id } });
    if (transactionCount > 0) throw new Error("Tipe kategori tidak dapat diubah karena sudah memiliki transaksi");
  }

  const category = await db.category.update({
    where: { id },
    data: input,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  return { success: true, category };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Kategori tidak ditemukan");

  const transactionCount = await db.transaction.count({ where: { categoryId: id } });
  if (transactionCount > 0) throw new Error("Kategori yang memiliki riwayat transaksi tidak dapat dihapus");

  await db.category.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  return { success: true };
}
