import { Sidebar } from "@/components/layout/Sidebar";
import { MonthFilter } from "@/components/layout/MonthFilter";
import { UserNav } from "@/components/layout/UserNav";
import { TransactionModal } from "@/components/transactions/TransactionModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3 md:px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800 hidden md:block">Dashboard</h1>
          <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
            <MonthFilter />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <TransactionModal />
    </div>
  );
}
