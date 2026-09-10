import { type Category, type Transaction, type SavingGoal } from "@/lib/types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Gaji", type: "INCOME", color: "#22c55e", icon: "Banknote" },
  { id: "cat-2", name: "Freelance", type: "INCOME", color: "#16a34a", icon: "Laptop" },
  { id: "cat-3", name: "Jajan", type: "EXPENSE", color: "#f97316", icon: "Coffee" },
  { id: "cat-4", name: "Date", type: "EXPENSE", color: "#ec4899", icon: "Heart" },
  { id: "cat-5", name: "Nongkrong", type: "EXPENSE", color: "#a855f7", icon: "Users" },
  { id: "cat-6", name: "Sehari-hari", type: "EXPENSE", color: "#3b82f6", icon: "ShoppingCart" },
  { id: "cat-7", name: "Tabungan", type: "EXPENSE", color: "#eab308", icon: "PiggyBank" },
  { id: "cat-8", name: "Transport", type: "EXPENSE", color: "#14b8a6", icon: "Car" },
];

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    userId: "user-1",
    categoryId: "cat-1",
    category: MOCK_CATEGORIES[0],
    amount: 8000000,
    type: "INCOME",
    date: new Date(year, month, 1),
    note: "Gaji bulanan",
    createdAt: new Date(year, month, 1),
  },
  {
    id: "tx-2",
    userId: "user-1",
    categoryId: "cat-3",
    category: MOCK_CATEGORIES[2],
    amount: 45000,
    type: "EXPENSE",
    date: new Date(year, month, 2),
    note: "Beli kopi sama nasi uduk",
    createdAt: new Date(year, month, 2),
  },
  {
    id: "tx-3",
    userId: "user-1",
    categoryId: "cat-5",
    category: MOCK_CATEGORIES[4],
    amount: 150000,
    type: "EXPENSE",
    date: new Date(year, month, 3),
    note: "Nongkrong di cafe",
    createdAt: new Date(year, month, 3),
  },
  {
    id: "tx-4",
    userId: "user-1",
    categoryId: "cat-4",
    category: MOCK_CATEGORIES[3],
    amount: 350000,
    type: "EXPENSE",
    date: new Date(year, month, 5),
    note: "Dinner sama si doi",
    createdAt: new Date(year, month, 5),
  },
  {
    id: "tx-5",
    userId: "user-1",
    categoryId: "cat-6",
    category: MOCK_CATEGORIES[5],
    amount: 200000,
    type: "EXPENSE",
    date: new Date(year, month, 7),
    note: "Belanja bulanan",
    createdAt: new Date(year, month, 7),
  },
  {
    id: "tx-6",
    userId: "user-1",
    categoryId: "cat-7",
    category: MOCK_CATEGORIES[6],
    amount: 1000000,
    type: "EXPENSE",
    date: new Date(year, month, 10),
    note: "Nabung buat liburan",
    createdAt: new Date(year, month, 10),
  },
  {
    id: "tx-7",
    userId: "user-1",
    categoryId: "cat-2",
    category: MOCK_CATEGORIES[1],
    amount: 2500000,
    type: "INCOME",
    date: new Date(year, month, 12),
    note: "Proyek website klien",
    createdAt: new Date(year, month, 12),
  },
  {
    id: "tx-8",
    userId: "user-1",
    categoryId: "cat-8",
    category: MOCK_CATEGORIES[7],
    amount: 80000,
    type: "EXPENSE",
    date: new Date(year, month, 14),
    note: "Grab & ojek",
    createdAt: new Date(year, month, 14),
  },
  {
    id: "tx-9",
    userId: "user-1",
    categoryId: "cat-3",
    category: MOCK_CATEGORIES[2],
    amount: 75000,
    type: "EXPENSE",
    date: new Date(year, month, 15),
    note: "Makan siang",
    createdAt: new Date(year, month, 15),
  },
  {
    id: "tx-10",
    userId: "user-1",
    categoryId: "cat-7",
    category: MOCK_CATEGORIES[6],
    amount: 500000,
    type: "EXPENSE",
    date: new Date(year, month, 20),
    note: "Nabung buat laptop baru",
    createdAt: new Date(year, month, 20),
  },
];

export const MOCK_SAVING_GOALS: SavingGoal[] = [
  {
    id: "goal-1",
    userId: "user-1",
    name: "Liburan Bali",
    targetAmount: 5000000,
    currentAmount: 1000000,
    status: "ONGOING",
    createdAt: new Date(year, month - 2, 1),
  },
  {
    id: "goal-2",
    userId: "user-1",
    name: "Laptop Baru",
    targetAmount: 15000000,
    currentAmount: 4500000,
    status: "ONGOING",
    createdAt: new Date(year, month - 1, 15),
  },
  {
    id: "goal-3",
    userId: "user-1",
    name: "Dana Darurat",
    targetAmount: 20000000,
    currentAmount: 20000000,
    status: "ACHIEVED",
    createdAt: new Date(year - 1, 0, 1),
  },
];

// Dashboard computed values
export const MOCK_DASHBOARD = {
  totalBalance: 8_570_000,
  totalIncomeThisMonth: 10_500_000,
  totalExpenseThisMonth: 2_400_000,
};

export const MOCK_EXPENSE_BREAKDOWN = [
  { categoryId: "cat-3", categoryName: "Jajan", color: "#f97316", amount: 120000, percentage: 5 },
  { categoryId: "cat-4", categoryName: "Date", color: "#ec4899", amount: 350000, percentage: 15 },
  { categoryId: "cat-5", categoryName: "Nongkrong", color: "#a855f7", amount: 150000, percentage: 6 },
  { categoryId: "cat-6", categoryName: "Sehari-hari", color: "#3b82f6", amount: 200000, percentage: 8 },
  { categoryId: "cat-7", categoryName: "Tabungan", color: "#eab308", amount: 1500000, percentage: 63 },
  { categoryId: "cat-8", categoryName: "Transport", color: "#14b8a6", amount: 80000, percentage: 3 },
];

export const MOCK_CASHFLOW_TREND = Array.from({ length: 20 }, (_, i) => ({
  date: String(i + 1).padStart(2, "0"),
  income: i === 0 ? 8000000 : i === 11 ? 2500000 : 0,
  expense: [1, 2, 4, 6, 9, 14, 19].includes(i)
    ? [45000, 150000, 350000, 200000, 1000000, 80000, 75000][
        [1, 2, 4, 6, 9, 14, 19].indexOf(i)
      ]
    : 0,
}));
