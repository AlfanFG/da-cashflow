"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CreditCard, CheckCircle2, Zap } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { payPaymentPlan } from "@/lib/actions/payment-plan.actions";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface PayPaymentModalProps {
  plan: {
    id: string;
    name: string;
    amount: number;
    paidAmount?: number;
  };
  open: boolean;
  onClose: () => void;
}

// ─── Currency Masking Helper ──────────────────────────────────────────────────
function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10);
}

function formatCurrencyInput(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("id-ID");
}

export function PayPaymentModal({ plan, open, onClose }: PayPaymentModalProps) {
  const currentPaid = plan.paidAmount ?? 0;
  const remaining = Math.max(0, plan.amount - currentPaid);

  const [amountRaw, setAmountRaw] = useState<number>(remaining);
  const [amountDisplay, setAmountDisplay] = useState<string>(
    formatCurrencyInput(remaining)
  );
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default nominal to remaining when modal opens or plan changes
  useEffect(() => {
    if (open) {
      const rem = Math.max(0, plan.amount - (plan.paidAmount ?? 0));
      setAmountRaw(rem);
      setAmountDisplay(rem > 0 ? formatCurrencyInput(rem) : "");
      setNote("");
      setPaidAt(new Date());
    }
  }, [open, plan]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyInput(e.target.value);
    setAmountRaw(raw);
    setAmountDisplay(raw === 0 ? "" : formatCurrencyInput(raw));
  };

  const handlePayFull = () => {
    setAmountRaw(remaining);
    setAmountDisplay(formatCurrencyInput(remaining));
  };

  const handleClose = () => {
    setNote("");
    setPaidAt(new Date());
    onClose();
  };

  const isFullPayment = amountRaw >= remaining && remaining > 0;
  const remainingAfterPayment = Math.max(0, remaining - amountRaw);
  const currentPercentage = plan.amount > 0 ? Math.min(100, Math.round((currentPaid / plan.amount) * 100)) : 0;
  const newPercentage = plan.amount > 0 ? Math.min(100, Math.round(((currentPaid + amountRaw) / plan.amount) * 100)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRaw <= 0) {
      toast.error("Nominal pembayaran harus lebih dari nol");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await payPaymentPlan(plan.id, {
        amount: amountRaw,
        note: note.trim() || undefined,
        paidAt,
      });

      if (result.isPaid) {
        toast.success(
          `Pembayaran "${plan.name}" lunas! Saldo berkurang ${formatCurrency(amountRaw)}`
        );
      } else {
        toast.success(
          `Cicilan "${plan.name}" sebesar ${formatCurrency(amountRaw)} berhasil dicatat!`
        );
      }
      handleClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memproses pembayaran"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <DialogTitle>Bayar Tagihan / Cicilan</DialogTitle>
          </div>
        </DialogHeader>

        {/* Info Ringkasan Tagihan */}
        <div className="bg-slate-50/90 rounded-2xl p-4 space-y-3 border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nama Tagihan
              </span>
              <p className="font-bold text-slate-800 text-base">{plan.name}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Anggaran
              </span>
              <p className="font-bold text-slate-700">{formatCurrency(plan.amount)}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
              <span>Sudah Terbayar: <strong className="text-emerald-600">{formatCurrency(currentPaid)}</strong></span>
              <span>Sisa: <strong className="text-rose-600">{formatCurrency(remaining)}</strong></span>
            </div>
            <Progress value={currentPercentage} className="h-2 bg-slate-200/80" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 py-1">
          {/* Form Nominal Pembayaran dengan Masking Mata Uang */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="payment-amount" className="font-semibold text-slate-700">
                Nominal yang Dibayarkan (Rp)
              </Label>
              {remaining > 0 && amountRaw !== remaining && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Zap className="h-3 w-3" /> Bayar Penuh Sisa ({formatCurrency(remaining)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 pointer-events-none">
                Rp
              </span>
              <Input
                id="payment-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountDisplay}
                onChange={handleAmountChange}
                className="pl-11 text-right font-extrabold text-slate-900 text-lg tracking-tight"
                autoFocus
              />
            </div>

            {/* Live Status Hint */}
            {amountRaw > 0 && (
              <div
                className={cn(
                  "p-2.5 rounded-xl text-xs flex items-center justify-between border",
                  isFullPayment
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                    : "bg-blue-50 text-blue-800 border-blue-200/70"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {isFullPayment ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-blue-600 shrink-0" />
                  )}
                  <span>
                    {isFullPayment
                      ? "Pembayaran ini akan melunasi seluruh sisa tagihan! 🎉"
                      : `Cicilan sebagian. Sisa setelah ini: ${formatCurrency(remainingAfterPayment)}`}
                  </span>
                </div>
                <span className="font-bold shrink-0">{newPercentage}%</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Saldo akun akan otomatis berkurang sebesar nominal yang dibayarkan dan tercatat di riwayat transaksi.
            </p>
          </div>

          {/* Tanggal Bayar */}
          <div className="grid gap-2">
            <Label className="font-semibold text-slate-700">Tanggal Pembayaran</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-left font-normal h-10 w-full hover:bg-slate-50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {format(paidAt, "PPP", { locale: localeId })}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paidAt}
                  onSelect={(d) => d && setPaidAt(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Catatan Pembayaran */}
          <div className="grid gap-2">
            <Label htmlFor="pay-note" className="font-semibold text-slate-700">
              Catatan (Opsional)
            </Label>
            <Input
              id="pay-note"
              placeholder="Misal: Cicilan ke-1, Transfer BCA, DP 50%, dll."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || amountRaw <= 0}
              className={cn(
                "font-semibold text-white",
                isFullPayment
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                  : "bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200"
              )}
            >
              {isSubmitting
                ? "Memproses..."
                : isFullPayment
                ? `Lunasi ${formatCurrency(amountRaw)}`
                : `Bayar Cicilan ${formatCurrency(amountRaw)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
