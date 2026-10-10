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
import { CalendarIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createPaymentPlan, updatePaymentPlan } from "@/lib/actions/payment-plan.actions";
import { toast } from "sonner";
import { PaymentPlan } from "@/lib/types";

interface AddPaymentPlanModalProps {
  open: boolean;
  onClose: () => void;
  editPlan?: PaymentPlan | null;
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

// ─── Component ────────────────────────────────────────────────────────────────
export function AddPaymentPlanModal({
  open,
  onClose,
  editPlan,
}: AddPaymentPlanModalProps) {
  const isEdit = !!editPlan;

  const [name, setName] = useState(editPlan?.name ?? "");
  const [description, setDescription] = useState(editPlan?.description ?? "");
  const [amountRaw, setAmountRaw] = useState<number>(editPlan?.amount ?? 0);
  const [amountDisplay, setAmountDisplay] = useState<string>(
    editPlan ? formatCurrencyInput(editPlan.amount) : ""
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editPlan ? new Date(editPlan.dueDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyInput(e.target.value);
    setAmountRaw(raw);
    setAmountDisplay(raw === 0 ? "" : formatCurrencyInput(raw));
  };

  const resetForm = () => {
    setName(editPlan?.name ?? "");
    setDescription(editPlan?.description ?? "");
    setAmountRaw(editPlan?.amount ?? 0);
    setAmountDisplay(editPlan ? formatCurrencyInput(editPlan.amount) : "");
    setDueDate(editPlan ? new Date(editPlan.dueDate) : undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama pembayaran wajib diisi");
      return;
    }
    if (amountRaw <= 0) {
      toast.error("Nominal harus lebih dari nol");
      return;
    }
    if (!dueDate) {
      toast.error("Tanggal jatuh tempo wajib dipilih");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        amount: amountRaw,
        dueDate,
      };

      if (isEdit && editPlan) {
        await updatePaymentPlan(editPlan.id, payload);
        toast.success("Rencana pembayaran berhasil diperbarui!");
      } else {
        await createPaymentPlan(payload);
        toast.success("Rencana pembayaran berhasil ditambahkan!");
      }
      handleClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan rencana pembayaran"
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
            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-violet-600" />
            </div>
            <DialogTitle>
              {isEdit ? "Edit Rencana Pembayaran" : "Tambah Rencana Pembayaran"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {/* Nama */}
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Nama Pembayaran</Label>
            <Input
              id="plan-name"
              placeholder="Misal: Cicilan Laptop, Langganan Netflix, Listrik"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Deskripsi */}
          <div className="grid gap-2">
            <Label htmlFor="plan-desc">Deskripsi (Opsional)</Label>
            <Textarea
              id="plan-desc"
              placeholder="Tambahkan catatan atau keterangan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Nominal dengan currency mask */}
          <div className="grid gap-2">
            <Label htmlFor="plan-amount">Nominal (Rp)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none">
                Rp
              </span>
              <Input
                id="plan-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountDisplay}
                onChange={handleAmountChange}
                className="pl-10 text-right font-semibold text-slate-800 text-lg"
              />
            </div>
            {amountRaw > 0 && (
              <p className="text-xs text-slate-400">
                {amountRaw.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                })}
              </p>
            )}
          </div>

          {/* Tanggal Jatuh Tempo */}
          <div className="grid gap-2">
            <Label>Tanggal Jatuh Tempo</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-left font-normal h-10 w-full hover:bg-slate-50",
                  !dueDate && "text-slate-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {dueDate
                  ? format(dueDate, "PPP", { locale: localeId })
                  : "Pilih tanggal jatuh tempo"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(d) => d && setDueDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
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
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Tambah Pembayaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
