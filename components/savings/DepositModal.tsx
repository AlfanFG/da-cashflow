"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { depositToSavingGoal } from "@/lib/actions/saving-goal.actions";
import { toast } from "sonner";

interface DepositModalProps {
  goal: { id: string; name: string; targetAmount: number; currentAmount: number };
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ goal, open, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = goal.targetAmount - goal.currentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Masukkan nominal yang valid");
      return;
    }

    setIsSubmitting(true);
    try {
      await depositToSavingGoal({
        savingGoalId: goal.id,
        amount: parseFloat(amount),
        note,
        date,
      });
      toast.success("Dana berhasil disetorkan! 🎉");
      setAmount("");
      setNote("");
      onClose();
    } catch {
      toast.error("Gagal menyetorkan dana");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
            </div>
            <DialogTitle>Setor Dana ke "{goal.name}"</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-1 py-2 bg-slate-50 rounded-xl text-sm text-slate-600 flex justify-between">
          <span>Sisa target:</span>
          <span className="font-semibold text-slate-800">
            Rp {remaining.toLocaleString("id-ID")}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="deposit-amount">Nominal Setoran (Rp)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0"
              className="text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-left font-normal h-10 w-full hover:bg-slate-50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deposit-note">Catatan (Opsional)</Label>
            <Textarea
              id="deposit-note"
              placeholder="Contoh: Gajian bulan ini"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Menyimpan..." : "Setor Dana"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
