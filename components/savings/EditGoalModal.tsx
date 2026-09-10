"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSavingGoal } from "@/lib/actions/saving-goal.actions";
import { toast } from "sonner";

interface EditGoalModalProps {
  goal: { id: string; name: string; targetAmount: number };
  open: boolean;
  onClose: () => void;
}

export function EditGoalModal({ goal, open, onClose }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      toast.error("Nama dan nominal target wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSavingGoal(goal.id, {
        name,
        targetAmount: parseFloat(targetAmount),
      });
      toast.success("Target tabungan berhasil diperbarui!");
      onClose();
    } catch {
      toast.error("Gagal memperbarui target tabungan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Target Tabungan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-goal-name">Nama Target</Label>
            <Input
              id="edit-goal-name"
              placeholder="Misal: Dana Darurat"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-goal-amount">Nominal Target (Rp)</Label>
            <Input
              id="edit-goal-amount"
              type="number"
              placeholder="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
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
