"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { EditBalanceModal } from "@/components/dashboard/EditBalanceModal";

export function SummaryCards({
  totalBalance,
  totalIncomeThisMonth,
  totalExpenseThisMonth,
  initialBalance,
}: {
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  initialBalance: number;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const cards = [
    {
      title: "Total Saldo",
      value: totalBalance,
      icon: Wallet,
      gradient: "from-slate-800 to-slate-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
      editable: true,
    },
    {
      title: "Pemasukan Bulan Ini",
      value: totalIncomeThisMonth,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
      editable: false,
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: totalExpenseThisMonth,
      icon: TrendingDown,
      gradient: "from-red-500 to-rose-600",
      textColor: "text-white",
      iconBg: "bg-white/20",
      editable: false,
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={
                "border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br " + card.gradient
              }
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className={"text-sm font-medium opacity-80 " + card.textColor}>
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {card.editable && (
                      <button
                        onClick={() => setEditOpen(true)}
                        title="Edit saldo awal"
                        className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      >
                        <Pencil className="h-3.5 w-3.5 text-white" />
                      </button>
                    )}
                    <div
                      className={
                        "h-10 w-10 rounded-xl flex items-center justify-center " + card.iconBg
                      }
                    >
                      <Icon className={"h-5 w-5 " + card.textColor} />
                    </div>
                  </div>
                </div>
                <p className={"text-3xl font-bold tracking-tight " + card.textColor}>
                  {formatCurrency(card.value)}
                </p>
                {card.editable && initialBalance !== 0 && (
                  <p className="text-xs text-white/60 mt-1">
                    Termasuk saldo awal {formatCurrency(initialBalance)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EditBalanceModal
        open={editOpen}
        onOpenChange={setEditOpen}
        currentBalance={totalBalance}
        initialBalance={initialBalance}
      />
    </>
  );
}
