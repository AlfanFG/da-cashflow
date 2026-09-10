"use server";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";

// ─── Default categories for new users ────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { name: "Gaji", type: "INCOME" as const, color: "#10b981", icon: "💼" },
  { name: "Freelance", type: "INCOME" as const, color: "#3b82f6", icon: "💻" },
  { name: "Lainnya (Pemasukan)", type: "INCOME" as const, color: "#94a3b8", icon: "💰" },
  { name: "Jajan", type: "EXPENSE" as const, color: "#f59e0b", icon: "🍜" },
  { name: "Date", type: "EXPENSE" as const, color: "#ec4899", icon: "❤️" },
  { name: "Nongkrong", type: "EXPENSE" as const, color: "#8b5cf6", icon: "☕" },
  { name: "Sehari-hari", type: "EXPENSE" as const, color: "#ef4444", icon: "🛒" },
  { name: "Transport", type: "EXPENSE" as const, color: "#06b6d4", icon: "🚗" },
  { name: "Tabungan", type: "EXPENSE" as const, color: "#64748b", icon: "🐷" },
  { name: "Lainnya (Pengeluaran)", type: "EXPENSE" as const, color: "#94a3b8", icon: "💸" },
];

// ─── Register ─────────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function registerUser(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan login." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create default categories for this user
  await db.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId: user.id,
    })),
  });

  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
  _prevState: { error?: string },
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." };
        default:
          return { error: "Terjadi kesalahan. Silakan coba lagi." };
      }
    }
    throw error;
  }
  return {};
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
