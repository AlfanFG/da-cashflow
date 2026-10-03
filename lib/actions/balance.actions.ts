"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const balanceSchema = z.object({
  initialBalance: z.number().finite("Nominal tidak valid"),
});

export async function updateInitialBalance(initialBalance: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const input = balanceSchema.parse({ initialBalance });

  await db.user.update({
    where: { id: session.user.id },
    data: { initialBalance: input.initialBalance },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getInitialBalance() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { initialBalance: true },
  });

  return user?.initialBalance ?? 0;
}
