import { CategoryManager } from "@/components/categories/CategoryManager";
import { getCategories } from "@/lib/actions/category.actions";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24 md:pb-0">
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-800">Kategori</h1><p className="text-sm text-slate-500">Sesuaikan kategori pemasukan dan pengeluaran Anda.</p></div>
      <CategoryManager categories={categories} />
    </div>
  );
}
