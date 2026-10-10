"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { getSavingGoals } from "@/lib/actions/saving-goal.actions";
import { toast } from "sonner";
import type { Category, SavingGoal } from "@/lib/types";

export function TransactionModal() {
	const { transactionModal } = useAppStore();
	const { isOpen, type, closeModal } = transactionModal;

	const [date, setDate] = useState<Date>(new Date());
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [note, setNote] = useState("");
	const [savingGoalId, setSavingGoalId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [categories, setCategories] = useState<Category[]>([]);
	const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);

	const handleClose = () => {
		setAmount("");
		setCategoryId("");
		setSavingGoalId("");
		setNote("");
		closeModal();
	};

	useEffect(() => {
		if (isOpen) {
			// Reset form fields immediately when modal opens or switches between INCOME & EXPENSE
			setCategoryId("");
			setSavingGoalId("");
			setAmount("");
			setNote("");
			setDate(new Date());

			// Fetch categories for the current transaction type
			getCategories().then((cats) => {
				setCategories(cats.filter((c) => c.type === type) as any);
			});

			// Fetch saving goals if type is EXPENSE (untuk kategori Tabungan)
			if (type === "EXPENSE") {
				getSavingGoals().then((goals) =>
					setSavingGoals(goals.filter((g) => g.status === "ONGOING")),
				);
			} else {
				setSavingGoals([]);
			}
		} else {
			// Clear fields when closed
			setCategoryId("");
			setSavingGoalId("");
			setAmount("");
			setNote("");
		}
	}, [isOpen, type]);

	// Validate category selection against current loaded categories
	const selectedCategory = categories.find((c) => c.id === categoryId);
	const isSavingCategory = selectedCategory?.name === "Tabungan";
	const selectedSavingGoal = savingGoals.find((g) => g.id === savingGoalId);

	// Guarded IDs: Never pass an outdated UUID from another type to Select value
	const activeCategoryId = selectedCategory ? categoryId : "";
	const activeSavingGoalId = selectedSavingGoal ? savingGoalId : "";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!amount || !activeCategoryId) {
			toast.error("Nominal dan Kategori harus diisi");
			return;
		}

		if (isSavingCategory && !activeSavingGoalId) {
			toast.error("Pilih target tabungan untuk kategori ini");
			return;
		}

		setIsSubmitting(true);
		try {
			await createTransaction({
				amount: parseFloat(amount),
				type,
				date,
				categoryId: activeCategoryId,
				note: note.trim() || undefined,
				savingGoalId: isSavingCategory ? activeSavingGoalId : undefined,
			});
			toast.success("Transaksi berhasil ditambahkan!");
			handleClose();
		} catch (error) {
			toast.error("Gagal menambahkan transaksi");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Tambah {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="amount">Nominal (Rp)</Label>
						<Input
							id="amount"
							type="number"
							placeholder="0"
							className="text-lg"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="category">Kategori</Label>
						<Select
							key={`category-select-${type}-${isOpen ? "open" : "closed"}`}
							value={activeCategoryId}
							onValueChange={(val) => setCategoryId(val ?? "")}
							items={categories.map((c) => ({ value: c.id, label: c.name }))}
						>
							<SelectTrigger id="category">
								<SelectValue placeholder="Pilih Kategori">
									{selectedCategory ? (
										<div className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full shrink-0"
												style={{ backgroundColor: selectedCategory.color }}
											/>
											<span>{selectedCategory.name}</span>
										</div>
									) : (
										<span className="text-muted-foreground">Pilih Kategori</span>
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										<div className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full shrink-0"
												style={{ backgroundColor: cat.color }}
											/>
											<span>{cat.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{isSavingCategory && (
						<div className="grid gap-2">
							<Label htmlFor="savingGoal">Pilih Target Tabungan</Label>
							<Select
								key={`saving-select-${isOpen ? "open" : "closed"}`}
								value={activeSavingGoalId}
								onValueChange={(val) => setSavingGoalId(val ?? "")}
								items={savingGoals.map((g) => ({ value: g.id, label: g.name }))}
							>
								<SelectTrigger id="savingGoal">
									<SelectValue placeholder="Pilih Target">
										{selectedSavingGoal ? (
											<span>{selectedSavingGoal.name}</span>
										) : (
											<span className="text-muted-foreground">Pilih Target</span>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{savingGoals.map((goal) => (
										<SelectItem key={goal.id} value={goal.id}>
											{goal.name}
										</SelectItem>
									))}
									{savingGoals.length === 0 && (
										<SelectItem value="none" disabled>
											Tidak ada target aktif
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="grid gap-2">
						<Label>Tanggal</Label>
						<Popover>
							<PopoverTrigger
								className={cn(
									"inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-left font-normal h-10 w-full hover:bg-slate-50",
									!date && "text-slate-500",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date ? format(date, "PPP") : <span>Pilih tanggal</span>}
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={date}
									onSelect={(d) => d && setDate(d)}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="note">Catatan (Opsional)</Label>
						<Textarea
							id="note"
							placeholder="Tulis catatan di sini..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
						/>
					</div>

					<div className="flex justify-end gap-2 mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Batal
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
