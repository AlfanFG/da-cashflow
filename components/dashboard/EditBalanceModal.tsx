"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInitialBalance } from "@/lib/actions/balance.actions";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

interface EditBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;  // total saldo saat ini (transactionBalance + initialBalance)
  initialBalance: number;  // saldo awal yang tersimpan di DB
}

export function EditBalanceModal({
  open,
  onOpenChange,
  currentBalance,
  initialBalance,
}: EditBalanceModalProps) {
  // Pre-fill dengan total saldo saat ini agar user langsung mengetik angka yang diinginkan
  const [value, setValue] = useState(currentBalance.toString());
  const [isPending, startTransition] = useTransition();

  const transactionBalance = currentBalance - initialBalance;

  // Hitung preview saldo awal baru berdasarkan input user
  const parsedValue = parseFloat(value);
  const previewInitialBalance = isNaN(parsedValue)
    ? null
    : parsedValue - transactionBalance;

  function formatRp(num: number) {
    return new Intl.NumberFormat("id-ID").format(num);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9-]/g, "");
    setValue(raw);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(parsedValue)) {
      toast.error("Masukkan angka yang valid");
      return;
    }

    // Hitung saldo awal baru = total yang diinginkan - saldo dari transaksi
    const newInitialBalance = parsedValue - transactionBalance;

    startTransition(async () => {
      try {
        await updateInitialBalance(newInitialBalance);
        toast.success("Saldo berhasil diperbarui!");
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
            <DialogTitle className="text-lg font-semibold">Edit Saldo</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            Masukkan total saldo yang Anda inginkan. Sistem akan menyesuaikan secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Breakdown saldo saat ini */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Saldo dari transaksi</span>
              <span className="font-medium text-slate-700">
                Rp {formatRp(transactionBalance)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Penyesuaian saldo</span>
              <span className="font-medium text-slate-700">
                Rp {formatRp(initialBalance)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-800">
              <span>Total Saldo Saat Ini</span>
              <span>Rp {formatRp(currentBalance)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBalance" className="text-sm font-medium text-slate-700">
              Total Saldo Baru
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                Rp
              </span>
              <Input
                id="newBalance"
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleInput}
                placeholder="0"
                className="pl-10 text-right font-medium"
                disabled={isPending}
              />
            </div>
            {previewInitialBalance !== null && previewInitialBalance !== 0 && (
              <p className="text-xs text-slate-400">
                Penyesuaian otomatis:{" "}
                <span className={previewInitialBalance >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {previewInitialBalance >= 0 ? "+" : ""}Rp {formatRp(previewInitialBalance)}
                </span>
              </p>
            )}
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
