"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { SavingGoal } from "@/lib/types";

export function SavingGoalsWidget({ goals }: { goals: SavingGoal[] }) {
  const allOngoing = goals.filter((g) => g.status === "ONGOING");
  const allAchieved = goals.filter((g) => g.status === "ACHIEVED");
  const ongoingTotal = allOngoing.reduce((sum, g) => sum + g.currentAmount, 0);
  const achievedTotal = allAchieved.reduce((sum, g) => sum + g.currentAmount, 0);
  const ongoingGoals = allOngoing.slice(0, 3);

  return (
    <Card className="col-span-1 lg:col-span-3 border-0 shadow-sm shadow-slate-200 rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">Target Tabungan</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Tercapai: {formatCurrency(achievedTotal)} ({allAchieved.length})
              </span>
              <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Belum Tercapai: {formatCurrency(ongoingTotal)} ({allOngoing.length})
              </span>
            </div>
          </div>
        </div>
        <Link href="/dashboard/savings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center transition-colors">
          Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-3">
          {ongoingGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="space-y-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-800">{goal.name}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2.5 bg-slate-200" />
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
          {ongoingGoals.length === 0 && (
            <p className="text-sm text-slate-500 col-span-3 text-center py-4">Belum ada target aktif.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
