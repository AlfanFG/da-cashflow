"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

export async function updateProfile(data: { name: string; email: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.user.findFirst({
    where: { email: data.email, NOT: { id: session.user.id } },
  });
  if (existing) return { error: "Email sudah digunakan oleh akun lain." };

  await db.user.update({
    where: { id: session.user.id },
    data: { name: data.name, email: data.email },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User tidak ditemukan." };

  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) return { error: "Password saat ini tidak sesuai." };

  if (data.newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }

  const hashed = await bcrypt.hash(data.newPassword, 12);
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}
