"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export function SummaryCards({ 
  totalBalance, 
  totalIncomeThisMonth, 
  totalExpenseThisMonth 
}: { 
  totalBalance: number, 
  totalIncomeThisMonth: number, 
  totalExpenseThisMonth: number 
}) {
  const cards = [
    {
      title: "Total Saldo",
      value: totalBalance,
      icon: Wallet,
      gradient: "from-slate-800 to-slate-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
    },
    {
      title: "Pemasukan Bulan Ini",
      value: totalIncomeThisMonth,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: totalExpenseThisMonth,
      icon: TrendingDown,
      gradient: "from-red-500 to-rose-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={"border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br " + card.gradient}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className={"text-sm font-medium opacity-80 " + card.textColor}>{card.title}</p>
                <div className={"h-10 w-10 rounded-xl flex items-center justify-center " + card.iconBg}>
                  <Icon className={"h-5 w-5 " + card.textColor} />
                </div>
              </div>
              <p className={"text-3xl font-bold tracking-tight " + card.textColor}>
                {formatCurrency(card.value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
