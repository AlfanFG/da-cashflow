"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTransaction } from "@/lib/actions/transaction.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { toast } from "sonner";

interface EditTransactionModalProps {
  transaction: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: Date | string;
    categoryId: string;
    note?: string | null;
  };
  open: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, open, onClose }: EditTransactionModalProps) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [note, setNote] = useState(transaction.note || "");
  const [date, setDate] = useState<Date>(new Date(transaction.date));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.categoryId);
      setNote(transaction.note || "");
      setDate(new Date(transaction.date));
      getCategories().then((cats) =>
        setCategories(cats.filter((c) => c.type === transaction.type))
      );
    }
  }, [open, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) {
      toast.error("Nominal dan Kategori harus diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, {
        amount: parseFloat(amount),
        type: transaction.type,
        date,
        categoryId,
        note,
      });
      toast.success("Transaksi berhasil diperbarui!");
      onClose();
    } catch {
      toast.error("Gagal memperbarui transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit {transaction.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-amount">Nominal (Rp)</Label>
            <Input
              id="edit-amount"
              type="number"
              placeholder="0"
              className="text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-category">Kategori</Label>
            <Select value={categoryId} onValueChange={(val) => val && setCategoryId(val)}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-left font-normal h-10 w-full hover:bg-slate-50",
                  !date && "text-slate-500"
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
            <Label htmlFor="edit-note">Catatan (Opsional)</Label>
            <Textarea
              id="edit-note"
              placeholder="Tulis catatan di sini..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
