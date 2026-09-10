"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wallet } from "lucide-react";
import { registerUser } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, undefined as any);

  useEffect(() => {
    if (state?.success) {
      toast.success("Akun berhasil dibuat! Silakan login.");
      router.push("/login");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <Wallet className="text-white h-6 w-6" />
        </div>
        <span className="font-bold text-3xl tracking-tight text-slate-900">Cashflow</span>
      </div>

      <Card className="w-full max-w-sm border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        <CardHeader className="space-y-2 pt-8 pb-6">
          <CardTitle className="text-2xl text-center">Buat Akun</CardTitle>
          <CardDescription className="text-center">
            Mulai kelola keuangan Anda hari ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-5">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                {state.error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-600">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="John Doe" required className="h-11 rounded-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-600">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="h-11 rounded-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-600">Password</Label>
              <Input id="password" name="password" type="password" required className="h-11 rounded-lg" />
            </div>
            <Button type="submit" disabled={isPending} className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-base font-medium mt-2">
              {isPending ? "Memproses..." : "Buat Akun"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-8 pt-4">
          <div className="text-sm text-center w-full text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
