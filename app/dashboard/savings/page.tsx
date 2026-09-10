import { getSavingGoals } from "@/lib/actions/saving-goal.actions";
import { SavingGoalCard } from "@/components/savings/SavingGoalCard";
import { AddSavingGoalModal } from "@/components/savings/AddSavingGoalModal";

export default async function SavingsPage() {
  const goals = await getSavingGoals();
  const ongoingGoals = goals.filter((g) => g.status === "ONGOING");
  const achievedGoals = goals.filter((g) => g.status === "ACHIEVED");

  return (
    <div className="space-y-8 pb-24 md:pb-0 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm shadow-slate-200 border-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Target Tabungan</h1>
          <p className="text-slate-500 text-sm">Kelola dan pantau progress impian Anda.</p>
        </div>
        <AddSavingGoalModal />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-800">Target Aktif</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ongoingGoals.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">Belum ada target tabungan aktif.</p>
          ) : (
            ongoingGoals.map((goal) => <SavingGoalCard key={goal.id} goal={goal as any} />)
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-800">Telah Tercapai</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-90">
          {achievedGoals.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">Belum ada target yang tercapai.</p>
          ) : (
            achievedGoals.map((goal) => <SavingGoalCard key={goal.id} goal={goal as any} />)
          )}
        </div>
      </div>
    </div>
  );
}
