"use client";

import { useState } from "react";
import { PaymentPlan } from "@/lib/types";
import { PaymentPlanCard } from "@/components/payments/PaymentPlanCard";
import { AddPaymentPlanModal } from "@/components/payments/AddPaymentPlanModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";

interface PaymentManagerProps {
  plans: PaymentPlan[];
}

export function PaymentManager({ plans }: PaymentManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNPAID" | "PAID">("ALL");

  const unpaidPlans = plans.filter((p) => !p.isPaid);
  const paidPlans = plans.filter((p) => p.isPaid);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overduePlans = unpaidPlans.filter(
    (p) => new Date(p.dueDate) < today
  );

  // Summary figures
  const totalAllAmount = plans.reduce((acc, p) => acc + p.amount, 0);
  const totalUnpaidAmount = unpaidPlans.reduce((acc, p) => acc + p.amount, 0);
  const totalPaidAmount = paidPlans.reduce((acc, p) => acc + p.amount, 0);

  const displayedPlans = plans.filter((plan) => {
    if (filterTab === "UNPAID") return !plan.isPaid;
    if (filterTab === "PAID") return plan.isPaid;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm shadow-slate-200 border-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Budgeting Pembayaran
            </h1>
            <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-violet-200/60">
              {plans.length} Pembayaran
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Tracking jadwal pembayaran bulanan, cicilan, dan target pembelian barang atau event.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm shadow-violet-200"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Pembayaran
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Anggaran */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Budget Pembayaran
              </span>
              <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(totalAllAmount)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Akumulasi dari {plans.length} rencana pembayaran
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Belum Dibayar */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Belum Dibayar ({unpaidPlans.length})
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(totalUnpaidAmount)}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                {overduePlans.length > 0 ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {overduePlans.length} lewat tempo
                  </span>
                ) : (
                  <span>Semua tagihan sesuai jadwal</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sudah Dibayar / Selesai */}
        <Card className="border-0 shadow-sm shadow-slate-200 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Telah Dibayarkan ({paidPlans.length})
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(totalPaidAmount)}
              </p>
              <p className="text-xs text-emerald-600/90 mt-1 font-medium">
                {paidPlans.length > 0
                  ? `Berhasil diselesaikan dan dipotong dari saldo`
                  : `Belum ada pembayaran yang diselesaikan`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            filterTab === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Semua ({plans.length})
        </button>
        <button
          onClick={() => setFilterTab("UNPAID")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            filterTab === "UNPAID"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Belum Dibayar ({unpaidPlans.length})
        </button>
        <button
          onClick={() => setFilterTab("PAID")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            filterTab === "PAID"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Selesai / Lunas ({paidPlans.length})
        </button>
      </div>

      {/* Payment Plans Grid */}
      {displayedPlans.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-slate-200">
          <div className="h-12 w-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {filterTab === "ALL"
              ? "Belum ada rencana pembayaran"
              : filterTab === "UNPAID"
              ? "Tidak ada pembayaran yang belum lunas"
              : "Belum ada pembayaran yang diselesaikan"}
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {filterTab === "ALL"
              ? "Buat rencana pembayaran untuk cicilan, tagihan bulanan, atau target belanja barang/event."
              : "Semua pembayaran pada kategori ini sudah terorganisir."}
          </p>
          {filterTab === "ALL" && (
            <Button
              onClick={() => setModalOpen(true)}
              className="mt-4 bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah Pembayaran Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedPlans.map((plan) => (
            <PaymentPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {/* Modal Tambah Pembayaran */}
      <AddPaymentPlanModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
