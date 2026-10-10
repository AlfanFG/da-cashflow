"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  CreditCard,
  Undo2,
} from "lucide-react";
import { PayPaymentModal } from "@/components/payments/PayPaymentModal";
import { AddPaymentPlanModal } from "@/components/payments/AddPaymentPlanModal";
import { deletePaymentPlan, unpayPaymentPlan } from "@/lib/actions/payment-plan.actions";
import { toast } from "sonner";
import { PaymentPlan } from "@/lib/types";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
}

export function PaymentPlanCard({ plan }: PaymentPlanCardProps) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnpaying, setIsUnpaying] = useState(false);

  const dueDate = new Date(plan.dueDate);
  const now = new Date();
  // Strip time for clean date comparison
  const isOverdue = !plan.isPaid && dueDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const handleDelete = async () => {
    if (!confirm(`Hapus rencana pembayaran "${plan.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deletePaymentPlan(plan.id);
      toast.success("Rencana pembayaran berhasil dihapus");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pembayaran");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnpay = async () => {
    if (
      !confirm(
        `Batalkan status lunas untuk "${plan.name}"? Transaksi pengeluaran terkait akan dihapus dan saldo utama akan dikembalikan.`
      )
    )
      return;

    setIsUnpaying(true);
    try {
      await unpayPaymentPlan(plan.id);
      toast.success("Status pembayaran dikembalikan ke Belum Lunas. Saldo dikembalikan!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membatalkan status bayar");
    } finally {
      setIsUnpaying(false);
    }
  };

  return (
    <>
      <Card
        className={
          "overflow-hidden border-0 shadow-sm shadow-slate-200 rounded-2xl transition-all hover:shadow-md " +
          (plan.isPaid
            ? "bg-gradient-to-br from-emerald-50/60 to-white border-l-4 border-l-emerald-500"
            : isOverdue
            ? "bg-gradient-to-br from-rose-50/40 to-white border-l-4 border-l-rose-500"
            : "bg-white border-l-4 border-l-violet-500")
        }
      >
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-slate-800 leading-tight">
                {plan.name}
              </CardTitle>
              {plan.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{plan.description}</p>
              )}
            </div>

            {/* Status Badges */}
            {plan.isPaid ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex items-center gap-1 shrink-0 font-medium text-[11px] px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" /> Lunas
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 flex items-center gap-1 shrink-0 font-medium text-[11px] px-2 py-0.5">
                <AlertTriangle className="h-3 w-3" /> Lewat Jatuh Tempo
              </Badge>
            ) : (
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 flex items-center gap-1 shrink-0 font-medium text-[11px] px-2 py-0.5">
                <Clock className="h-3 w-3" /> Belum Dibayar
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pb-4 pt-1">
          {/* Amount / Budget */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Anggaran / Nominal
            </span>
            <p className="text-xl font-extrabold text-slate-800">
              {formatCurrency(plan.amount)}
            </p>
          </div>

          {/* Dates & Payment Details */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" /> Jatuh Tempo:
              </span>
              <span className={`font-semibold ${isOverdue ? "text-rose-600" : "text-slate-700"}`}>
                {formatDate(plan.dueDate)}
              </span>
            </div>

            {plan.isPaid && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span className="text-slate-400">Dibayar Pada:</span>
                <span className="font-semibold text-emerald-600">
                  {plan.paidAt ? formatDate(plan.paidAt) : "-"}
                </span>
              </div>
            )}

            {plan.isPaid && plan.paidNote && (
              <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                Catatan: "{plan.paidNote}"
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {!plan.isPaid ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setPayModalOpen(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs h-8.5 font-medium shadow-sm shadow-emerald-200"
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Bayar Sekarang
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  className="h-8.5 w-8.5 text-slate-500 hover:text-blue-600 hover:border-blue-300"
                  title="Edit Rencana"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8.5 w-8.5 text-slate-500 hover:text-rose-600 hover:border-rose-300"
                  title="Hapus Rencana"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnpay}
                  disabled={isUnpaying}
                  className="flex-1 text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 text-xs h-8.5"
                >
                  <Undo2 className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                  {isUnpaying ? "Membatalkan..." : "Batalkan Bayar"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8.5 w-8.5 text-slate-500 hover:text-rose-600 hover:border-rose-300"
                  title="Hapus Rencana"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <PayPaymentModal
        plan={{ id: plan.id, name: plan.name, amount: plan.amount }}
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
      />

      <AddPaymentPlanModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editPlan={plan}
      />
    </>
  );
}
