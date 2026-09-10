"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, Pencil } from "lucide-react";
import { deleteTransaction } from "@/lib/actions/transaction.actions";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { toast } from "sonner";
import { useState } from "react";

export function TransactionTable({ transactions }: { transactions: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<any | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    setIsDeleting(id);
    try {
      await deleteTransaction(id);
      toast.success("Transaksi berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus transaksi");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-600">Kategori</TableHead>
                <TableHead className="font-semibold text-slate-600">Catatan</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Nominal</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-slate-500 font-medium">
                    Belum ada transaksi di rentang waktu ini.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="whitespace-nowrap font-medium text-slate-600">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.category && (
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: tx.category.color }}
                          />
                        )}
                        <span className="font-medium text-slate-700">{tx.category?.name || "Lainnya"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] sm:max-w-[250px] truncate text-slate-500 text-sm">
                      {tx.note || "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}>
                        {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTx(tx)}
                          className="h-8 w-8 text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tx.id)}
                          disabled={isDeleting === tx.id}
                          className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          open={!!editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </>
  );
}
