import { getDashboardSummary, getExpenseBreakdown, getCashflowTrend } from "@/lib/actions/dashboard.actions";
import { getSavingGoals } from "@/lib/actions/saving-goal.actions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseDonutChart } from "@/components/dashboard/ExpenseDonutChart";
import { CashflowTrendChart } from "@/components/dashboard/CashflowTrendChart";
import { SavingGoalsWidget } from "@/components/dashboard/SavingGoalsWidget";
import { TransactionModalTrigger } from "@/components/transactions/TransactionModalTrigger";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month || (now.getMonth() + 1).toString());
  const year = parseInt(params.year || now.getFullYear().toString());

  const [summary, breakdownData, trendData, savingGoals] = await Promise.all([
    getDashboardSummary(month, year),
    getExpenseBreakdown(month, year),
    getCashflowTrend(month, year),
    getSavingGoals(),
  ]);

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ringkasan Keuangan</h1>
        <p className="text-slate-500 text-sm">Pantau arus kas Anda bulan ini dengan mudah.</p>
      </div>

      <SummaryCards
        totalBalance={summary.totalBalance}
        totalIncomeThisMonth={summary.totalIncomeThisMonth}
        totalExpenseThisMonth={summary.totalExpenseThisMonth}
        initialBalance={summary.initialBalance}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CashflowTrendChart data={trendData} />
        <ExpenseDonutChart data={breakdownData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SavingGoalsWidget goals={savingGoals} />
      </div>

      <TransactionModalTrigger />
    </div>
  );
}
