"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/category.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; type: "INCOME" | "EXPENSE"; color: string; icon: string | null };
type CategoryForm = Omit<Category, "id">;

const INITIAL_FORM: CategoryForm = { name: "", type: "EXPENSE", color: "#10b981", icon: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [type, setType] = useState<CategoryForm["type"]>("EXPENSE");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const visibleCategories = useMemo(() => categories.filter((category) => category.type === type), [categories, type]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, type });
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({ name: category.name, type: category.type, color: category.color, icon: category.icon ?? "" });
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, icon: form.icon || undefined };
      if (editing) await updateCategory(editing.id, data);
      else await createCategory(data);
      toast.success(editing ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      toast.success("Kategori berhasil dihapus");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus kategori");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
          {(["EXPENSE", "INCOME"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setType(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${type === item ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}>
              {item === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700"><Plus /> Tambah Kategori</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
            Belum ada kategori {type === "EXPENSE" ? "pengeluaran" : "pemasukan"}. Tambahkan kategori pertama Anda.
          </div>
        ) : visibleCategories.map((category) => (
          <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200">
            <div className="flex size-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${category.color}20` }}>{category.icon || <Tags className="size-5" style={{ color: category.color }} />}</div>
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-800">{category.name}</p><p className="text-xs text-slate-500">{category.type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}</p></div>
            <Button size="icon-sm" variant="ghost" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`}><Pencil /></Button>
            <Button size="icon-sm" variant="ghost" onClick={() => remove(category)} className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" aria-label={`Hapus ${category.name}`}><Trash2 /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-2"><Label htmlFor="category-name">Nama</Label><Input id="category-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={50} required /></div>
            <div className="grid gap-2"><Label>Tipe</Label><Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as CategoryForm["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EXPENSE">Pengeluaran</SelectItem><SelectItem value="INCOME">Pemasukan</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label htmlFor="category-color">Warna</Label><Input id="category-color" type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} className="h-10 p-1" /></div>
            <div className="grid gap-2"><Label htmlFor="category-icon">Icon emoji (opsional)</Label><Input id="category-icon" value={form.icon ?? ""} onChange={(event) => setForm({ ...form, icon: event.target.value })} maxLength={8} placeholder="☕" /></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">{saving ? "Menyimpan..." : "Simpan"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
