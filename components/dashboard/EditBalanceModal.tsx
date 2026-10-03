"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInitialBalance } from "@/lib/actions/balance.actions";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

interface EditBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number; // total saldo terhitung saat ini
  initialBalance: number; // nilai saldo awal yang tersimpan
}

export function EditBalanceModal({
  open,
  onOpenChange,
  currentBalance,
  initialBalance,
}: EditBalanceModalProps) {
  const [value, setValue] = useState(initialBalance.toString());
  const [isPending, startTransition] = useTransition();

  // Format angka ke rupiah untuk display
  function formatRp(num: number) {
    return new Intl.NumberFormat("id-ID").format(num);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Hanya izinkan angka dan minus di awal
    const raw = e.target.value.replace(/[^0-9-]/g, "");
    setValue(raw);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      toast.error("Masukkan angka yang valid");
      return;
    }

    startTransition(async () => {
      try {
        await updateInitialBalance(parsed);
        toast.success("Saldo awal berhasil diperbarui!");
        onOpenChange(false);
      } catch {
        toast.error("Gagal memperbarui saldo");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-slate-700" />
            </div>
            <DialogTitle className="text-lg font-semibold">Edit Saldo Awal</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            Atur saldo awal akun Anda. Nilai ini akan ditambahkan ke total kalkulasi transaksi untuk
            menentukan saldo akhir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Info: saldo terhitung dari transaksi */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Saldo dari transaksi</span>
              <span className="font-medium text-slate-700">
                Rp {formatRp(currentBalance - initialBalance)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Saldo awal (sekarang)</span>
              <span className="font-medium text-slate-700">Rp {formatRp(initialBalance)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-800">
              <span>Total Saldo</span>
              <span>Rp {formatRp(currentBalance)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance" className="text-sm font-medium text-slate-700">
              Saldo Awal Baru
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                Rp
              </span>
              <Input
                id="initialBalance"
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleInput}
                placeholder="0"
                className="pl-10 text-right font-medium"
                disabled={isPending}
              />
            </div>
            <p className="text-xs text-slate-400">
              Gunakan angka negatif jika saldo awal Anda minus. Contoh: -500000
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="bg-slate-800 hover:bg-slate-700">
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
