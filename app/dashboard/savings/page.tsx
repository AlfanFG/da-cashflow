import { getSavingGoals } from "@/lib/actions/saving-goal.actions";
import { SavingGoalCard } from "@/components/savings/SavingGoalCard";
import { AddSavingGoalModal } from "@/components/savings/AddSavingGoalModal";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function SavingsPage() {
  const goals = await getSavingGoals();
  const ongoingGoals = goals.filter((g) => g.status === "ONGOING");
  const achievedGoals = goals.filter((g) => g.status === "ACHIEVED");

  // Kalkulasi Akumulasi Keseluruhan
  const totalCurrentAll = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetAll = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercentage =
    totalTargetAll > 0
      ? Math.min(100, Math.round((totalCurrentAll / totalTargetAll) * 100))
      : 0;

  // Kalkulasi Target Belum Tercapai (Aktif/Berjalan)
  const ongoingCurrentTotal = ongoingGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const ongoingTargetTotal = ongoingGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const ongoingRemainingTotal = Math.max(0, ongoingTargetTotal - ongoingCurrentTotal);
  const ongoingPercentage =
    ongoingTargetTotal > 0
      ? Math.min(100, Math.round((ongoingCurrentTotal / ongoingTargetTotal) * 100))
      : 0;

  // Kalkulasi Target Telah Tercapai
  const achievedCurrentTotal = achievedGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const achievedTargetTotal = achievedGoals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <div className="space-y-8 pb-24 md:pb-0 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm shadow-slate-200 border-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Target Tabungan</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {goals.length} Target
            </span>
          </div>
          <p className="text-slate-500 text-sm">Kelola dan pantau progress impian Anda.</p>
        </div>
        <AddSavingGoalModal />
      </div>

      {/* Summary Cards: Ringkasan Total Pencapaian & Belum Tercapai */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Saldo Terkumpul */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tabungan Terkumpul
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(totalCurrentAll)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Dari target total {formatCurrency(totalTargetAll)} ({overallPercentage}%)
              </p>
            </div>
            <Progress value={overallPercentage} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>

        {/* Card 2: Total Telah Tercapai */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Telah Tercapai ({achievedGoals.length})
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(achievedCurrentTotal)}</p>
              <p className="text-xs text-emerald-600/90 mt-1 font-medium">
                {achievedGoals.length > 0
                  ? `Sukses mencapai ${achievedGoals.length} impian tabungan!`
                  : "Belum ada target yang diselesaikan"}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 flex justify-between items-center">
              <span>Status: Selesai</span>
              <span className="font-semibold text-emerald-600">100% Tercapai</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Belum Tercapai (Aktif) */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Belum Tercapai ({ongoingGoals.length})
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(ongoingCurrentTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Target: <span className="font-semibold text-slate-700">{formatCurrency(ongoingTargetTotal)}</span>
              </p>
            </div>
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg flex justify-between items-center">
              <span>Sisa yang harus ditabung:</span>
              <span className="font-bold text-rose-600">{formatCurrency(ongoingRemainingTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bagian 1: Target Belum Tercapai (Aktif) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-slate-800">Target Belum Tercapai (Aktif)</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {ongoingGoals.length}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              Terkumpul: <strong className="text-slate-800">{formatCurrency(ongoingCurrentTotal)}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Target: <strong className="text-slate-800">{formatCurrency(ongoingTargetTotal)}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Sisa: <strong className="text-rose-600 font-semibold">{formatCurrency(ongoingRemainingTotal)}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ongoingGoals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-200 col-span-full">
              <p className="text-slate-500 text-sm">Tidak ada target tabungan yang sedang berjalan.</p>
            </div>
          ) : (
            ongoingGoals.map((goal) => <SavingGoalCard key={goal.id} goal={goal as any} />)
          )}
        </div>
      </div>

      {/* Bagian 2: Target Telah Tercapai */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-slate-800">Target Telah Tercapai</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {achievedGoals.length}
            </span>
          </div>
          <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
            Total Tercapai: <strong className="font-bold text-emerald-700">{formatCurrency(achievedCurrentTotal)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievedGoals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-200 col-span-full">
              <p className="text-slate-500 text-sm">Belum ada target yang berhasil tercapai.</p>
            </div>
          ) : (
            achievedGoals.map((goal) => <SavingGoalCard key={goal.id} goal={goal as any} />)
          )}
        </div>
      </div>
    </div>
  );
}
