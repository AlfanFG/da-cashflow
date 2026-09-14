"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LayoutDashboard, Receipt, PiggyBank, Menu, Wallet, User, Settings, Tags, ChartNoAxesColumnIncreasing } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Riwayat", href: "/dashboard/history", icon: Receipt },
  { title: "Tabungan", href: "/dashboard/savings", icon: PiggyBank },
  { title: "Budget", href: "/dashboard/budgets", icon: ChartNoAxesColumnIncreasing },
  { title: "Kategori", href: "/dashboard/categories", icon: Tags },
];

const bottomNavItems = [
  { title: "Profile", href: "/dashboard/profile", icon: User },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Pages yang membaca filter — Tabungan & Profile tidak perlu filter bulan
const FILTER_AWARE_PAGES = ["/dashboard", "/dashboard/history", "/dashboard/budgets"];

function SidebarContent({ onClickLink }: { onClickLink?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ambil filter params yang aktif saat ini
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  // Build query string untuk disertakan pada link yang filter-aware
  const filterQuery =
    month && year ? `?month=${month}&year=${year}` : "";

  const buildHref = (href: string) => {
    const isFilterAware = FILTER_AWARE_PAGES.includes(href);
    return isFilterAware ? `${href}${filterQuery}` : href;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-4">
        Menu Utama
      </p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={buildHref(item.href)} onClick={onClickLink}>
            <span
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-transparent"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")} />
              {item.title}
            </span>
          </Link>
        );
      })}

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-4 px-4">
        Akun
      </p>
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={onClickLink}>
            <span
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-transparent"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")} />
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function SidebarInner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Wallet className="text-white h-4 w-4" />
          </div>
          <span className="font-bold text-lg text-slate-800">Cashflow</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-100 h-10 w-10 text-slate-700">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-80 border-r-0 px-4">
            <SheetHeader className="pb-4 border-b text-left">
              <SheetTitle className="flex items-center gap-2">
                <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Wallet className="text-white h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-800">Cashflow</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full py-4">
              <SidebarContent onClickLink={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] h-screen bg-white border-r px-4 py-6 sticky top-0">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <Wallet className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">Cashflow</span>
        </div>
        <nav className="flex-1">
          <SidebarContent />
        </nav>
      </aside>
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}
