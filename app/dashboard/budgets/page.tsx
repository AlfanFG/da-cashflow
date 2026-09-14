import { BudgetList } from "@/components/budgets/BudgetList";
import { getBudgetsProgress } from "@/lib/actions/budget.actions";
import { getMonthName } from "@/lib/utils";

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const params = await searchParams;
  const now = new Date();
  const month = Number.parseInt(params.month ?? String(now.getMonth() + 1), 10);
  const year = Number.parseInt(params.year ?? String(now.getFullYear()), 10);
  const budgets = await getBudgetsProgress(month, year);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24 md:pb-0">
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-800">Budget</h1><p className="text-sm text-slate-500">Pantau alokasi dan pengeluaran kategori untuk {getMonthName(month)} {year}.</p></div>
      <BudgetList budgets={budgets} month={month} year={year} />
    </div>
  );
}
