"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { payPaymentPlan } from "@/lib/actions/payment-plan.actions";
import { toast } from "sonner";

interface PayPaymentModalProps {
  plan: {
    id: string;
    name: string;
    amount: number;
  };
  open: boolean;
  onClose: () => void;
}

export function PayPaymentModal({ plan, open, onClose }: PayPaymentModalProps) {
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setNote("");
    setPaidAt(new Date());
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await payPaymentPlan(plan.id, {
        note: note.trim() || undefined,
        paidAt,
      });
      toast.success(`Pembayaran "${plan.name}" berhasil dicatat! Saldo berkurang ${formatCurrency(plan.amount)}`);
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
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          </div>
        </DialogHeader>

        {/* Info Pembayaran */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Nama</span>
            <span className="font-semibold text-slate-800">{plan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Nominal</span>
            <span className="font-bold text-rose-600 text-base">{formatCurrency(plan.amount)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 -mt-1">
          Saldo akun Anda akan berkurang sebesar <strong>{formatCurrency(plan.amount)}</strong> dan dicatat di riwayat transaksi.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Tanggal Bayar */}
          <div className="grid gap-2">
            <Label>Tanggal Pembayaran</Label>
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

          {/* Catatan */}
          <div className="grid gap-2">
            <Label htmlFor="pay-note">Catatan (Opsional)</Label>
            <Input
              id="pay-note"
              placeholder="Misal: Transfer BCA, Cash, dll."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-1">
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
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
