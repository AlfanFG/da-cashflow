"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { SavingGoal } from "@/lib/types";

export function SavingGoalsWidget({ goals }: { goals: SavingGoal[] }) {
  const ongoingGoals = goals.filter(g => g.status === "ONGOING").slice(0, 3);

  return (
    <Card className="col-span-1 lg:col-span-3 border-0 shadow-sm shadow-slate-200 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-800">Target Tabungan</CardTitle>
        </div>
        <Link href="/dashboard/savings" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center transition-colors">
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
