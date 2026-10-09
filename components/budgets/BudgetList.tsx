"use client";

import { useState } from "react";
import { Pencil, WalletCards, PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import { upsertBudget } from "@/lib/actions/budget.actions";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BudgetProgress = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string | null;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  rawPercentage: number;
  status: "NORMAL" | "WARNING" | "OVER";
};

function BudgetSummaryCards({ budgets }: { budgets: BudgetProgress[] }) {
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;
  const isOver = totalSpent > totalAllocated && totalAllocated > 0;
  const categoriesWithBudget = budgets.filter((b) => b.allocatedAmount > 0).length;
  const categoriesOver = budgets.filter((b) => b.status === "OVER" && b.allocatedAmount > 0).length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Total Dialokasikan */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50">
            <PiggyBank className="size-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Total Dialokasikan</p>
            <p className="mt-0.5 truncate text-lg font-bold text-slate-800">
              {totalAllocated > 0 ? formatCurrency(totalAllocated) : "Belum ada"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {categoriesWithBudget} dari {budgets.length} kategori telah diatur
        </p>
      </div>

      {/* Total Dikeluarkan */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50">
            <TrendingDown className="size-5 text-rose-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Total Dikeluarkan</p>
            <p className="mt-0.5 truncate text-lg font-bold text-slate-800">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>{Math.round(overallPercentage)}% dari total alokasi</span>
            {categoriesOver > 0 && (
              <span className="font-semibold text-rose-500">{categoriesOver} kategori melebihi</span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                isOver ? "bg-rose-500" : overallPercentage >= 80 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sisa Budget */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${
              isOver ? "bg-rose-50" : "bg-emerald-50"
            }`}
          >
            <Wallet className={`size-5 ${isOver ? "text-rose-600" : "text-emerald-600"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">{isOver ? "Melebihi Budget" : "Sisa Budget"}</p>
            <p className={`mt-0.5 truncate text-lg font-bold ${isOver ? "text-rose-600" : "text-emerald-700"}`}>
              {totalAllocated > 0 ? formatCurrency(Math.abs(totalRemaining)) : "—"}
            </p>
          </div>
        </div>
        <p className={`mt-3 text-xs ${isOver ? "text-rose-400" : "text-slate-400"}`}>
          {totalAllocated === 0
            ? "Atur alokasi kategori untuk memantau sisa"
            : isOver
            ? `Pengeluaran melebihi alokasi ${formatCurrency(Math.abs(totalRemaining))}`
            : "Masih tersisa dari total alokasi bulan ini"}
        </p>
      </div>
    </div>
  );
}

export function BudgetList({ budgets, month, year }: { budgets: BudgetProgress[]; month: number; year: number }) {
  const [selected, setSelected] = useState<BudgetProgress | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const openBudget = (budget: BudgetProgress) => {
    setSelected(budget);
    setAmount(budget.allocatedAmount ? budget.allocatedAmount.toString() : "");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !amount) return toast.error("Masukkan nominal alokasi");
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) return toast.error("Nominal alokasi tidak valid");
    setSaving(true);
    try {
      await upsertBudget({ categoryId: selected.categoryId, amount: parsedAmount, month, year });
      toast.success("Alokasi budget berhasil disimpan");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan alokasi budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BudgetSummaryCards budgets={budgets} />
      {budgets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          Belum ada kategori pengeluaran. Buat kategori terlebih dahulu agar dapat mengatur budget.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {budgets.map((budget) => {
          const appearance =
            budget.status === "OVER"
              ? {
                  bar: "bg-rose-500",
                  text: "text-rose-600",
                  label: budget.allocatedAmount === 0 ? "Belum dialokasikan" : "Melebihi budget",
                }
              : budget.status === "WARNING"
              ? { bar: "bg-amber-500", text: "text-amber-600", label: "Mendekati batas" }
              : { bar: "bg-emerald-500", text: "text-emerald-600", label: "Terkendali" };
          return (
            <article
              key={budget.categoryId}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex size-11 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${budget.categoryColor}20` }}
                >
                  {budget.categoryIcon || <WalletCards className="size-5" style={{ color: budget.categoryColor }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-slate-800">{budget.categoryName}</h2>
                  <p className={`mt-0.5 text-xs font-semibold ${appearance.text}`}>{appearance.label}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openBudget(budget)}>
                  <Pencil /> Setel Alokasi
                </Button>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-bold text-slate-800">{formatCurrency(budget.spentAmount)}</span>
                <span className="text-slate-400">
                  dari {budget.allocatedAmount ? formatCurrency(budget.allocatedAmount) : "belum ada alokasi"}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${appearance.bar}`}
                  style={{ width: `${budget.percentage}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs font-medium">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                  {Math.round(budget.rawPercentage)}% terpakai
                </span>
                <span className={budget.remainingAmount < 0 ? "text-rose-600" : "text-slate-500"}>
                  {budget.allocatedAmount
                    ? `${budget.remainingAmount < 0 ? "Lebih " : "Sisa "}${formatCurrency(Math.abs(budget.remainingAmount))}`
                    : "Atur budget untuk memantau sisa"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setel Alokasi Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <p className="text-sm text-slate-500">
              Alokasi untuk <span className="font-semibold text-slate-700">{selected?.categoryName}</span>
            </p>
            <div className="grid gap-2">
              <Label htmlFor="budget-amount">Nominal (Rp)</Label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500000"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? "Menyimpan..." : "Simpan Alokasi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
