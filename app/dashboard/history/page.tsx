import { getTransactions } from "@/lib/actions/transaction.actions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModalTrigger } from "@/components/transactions/TransactionModalTrigger";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month || (now.getMonth() + 1).toString());
  const year = parseInt(params.year || now.getFullYear().toString());

  const transactions = await getTransactions(month, year);

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Transaksi</h1>
        <p className="text-slate-500 text-sm">Lihat semua daftar pemasukan dan pengeluaran Anda.</p>
      </div>

      <TransactionTable transactions={transactions} />

      <TransactionModalTrigger />
    </div>
  );
}
