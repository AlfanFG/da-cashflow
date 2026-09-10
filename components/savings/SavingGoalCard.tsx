"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Clock, PiggyBank, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "@/components/savings/DepositModal";
import { EditGoalModal } from "@/components/savings/EditGoalModal";
import { deleteSavingGoal } from "@/lib/actions/saving-goal.actions";
import { toast } from "sonner";

interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  createdAt: Date | string;
}

export function SavingGoalCard({ goal }: { goal: SavingGoal }) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isAchieved = goal.status === "ACHIEVED";

  const handleDelete = async () => {
    if (!confirm(`Hapus target "${goal.name}"? Semua riwayat setoran juga akan terhapus.`)) return;
    setIsDeleting(true);
    try {
      await deleteSavingGoal(goal.id);
      toast.success("Target tabungan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus target tabungan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={
          "overflow-hidden border-0 shadow-sm shadow-slate-200 rounded-2xl transition-all hover:shadow-md " +
          (isAchieved ? "bg-gradient-to-br from-emerald-50 to-white" : "bg-white")
        }
      >
        <CardHeader className="pb-3 pt-5">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-bold text-slate-800 leading-tight">{goal.name}</CardTitle>
            <div
              className={
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap " +
                (isAchieved ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")
              }
            >
              {isAchieved ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Tercapai</>
              ) : (
                <><Clock className="w-3.5 h-3.5" /> Berjalan</>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2.5">
              <span className="text-slate-800">{formatCurrency(goal.currentAmount)}</span>
              <span className="text-slate-400">{formatCurrency(goal.targetAmount)}</span>
            </div>
            <Progress value={percentage} className="h-2.5 bg-slate-100" />
          </div>

          <div className="flex justify-between items-center text-xs font-medium text-slate-500 pt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{percentage}% Terkumpul</span>
          </div>

          {/* Action Buttons */}
          {!isAchieved && (
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                onClick={() => setDepositOpen(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
              >
                <PiggyBank className="mr-1.5 h-3.5 w-3.5" /> Setor Dana
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:border-blue-300"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:border-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DepositModal goal={goal} open={depositOpen} onClose={() => setDepositOpen(false)} />
      <EditGoalModal goal={goal} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
