// ─── Enums ───────────────────────────────────────────────────────────────────

export type TransactionType = "INCOME" | "EXPENSE";
export type CategoryType = "INCOME" | "EXPENSE";
export type SavingGoalStatus = "ONGOING" | "ACHIEVED";

// ─── Models ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  amount: number;
  type: TransactionType;
  date: Date;
  note?: string | null;
  createdAt: Date;
}

export interface SavingGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: SavingGoalStatus;
  createdAt: Date;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string | null;
  amount: number;
  dueDate: Date | string;
  isPaid: boolean;
  paidAt?: Date | string | null;
  paidNote?: string | null;
  categoryId?: string | null;
  userId: string;
  transactionId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
}

export interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface CashflowTrendItem {
  date: string;
  income: number;
  expense: number;
}

export interface TransactionModalState {
  isOpen: boolean;
  type: TransactionType;
}

export interface FilterState {
  selectedMonth: number;
  selectedYear: number;
}
