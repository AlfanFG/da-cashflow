<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

🚀 Project Blueprint: Next.js Cashflow & Savings Tracker
🛠️ Tech Stack & Architecture
Framework: Next.js 16 (App Router, Server Actions)

Database: Neon (Serverless PostgreSQL)

ORM: Prisma ORM

Styling & UI: Tailwind CSS v4, shadcn/ui (base-ui), Lucide Icons

State Management: Zustand (untuk UI state lokal & date filters)

Authentication: NextAuth.js (Auth.js) v5 (Credentials only - no Google OAuth)

Charts: Recharts

SAW Harness: .gemini/ folder dari https://github.com/bybren-llc/safe-agentic-workflow

🗄️ Database Schema Design (Neon DB)
Berikan konteks ini ke AI untuk men-generate Prisma/Drizzle schema.

User: id, name, email, password

Category: id, name (Gaji, Jajan, Date, Nongkrong, Sehari-hari, Tabungan), type (INCOME, EXPENSE), color, icon

Transaction: id, userId, categoryId, amount, type (INCOME, EXPENSE), date, note

SavingGoal: id, userId, name, targetAmount, currentAmount, status (ONGOING, ACHIEVED)

🧠 Zustand Store Structure (AppStore)
transactionModal: state isOpen, type (INCOME/EXPENSE), action openModal, closeModal.

filter: state selectedMonth, selectedYear, action setFilter.

📋 Task Execution Milestones (Vibe Coding Prompts)
Phase 1: Project Initialization & Infrastructure
[x] Inisialisasi Next.js app dengan Tailwind CSS dan TypeScript.
[x] Inisialisasi komponen shadcn/ui (Button, Card, Input, Select, Dialog/Modal, Form, Table, Calendar, Popover, Sonner, dll).
[x] Setup dependencies: zustand, recharts, prisma, next-auth@beta, date-fns, lucide-react, sonner.
[x] Setup Zustand store (useAppStore) untuk global UI state dan filter bulan/tahun.
[x] Setup TypeScript types (lib/types/index.ts) dan mock data (lib/mock/data.ts).
[x] Setup SAW Harness (.gemini/ folder + .harness-manifest.yml).

Phase 2: Authentication (Login & Register)
[x] Buat halaman /login dan /register dengan UI modern menggunakan shadcn/ui Card dan Form.
[x] Buat Layout utama (Sidebar + UserNav Dropdown) dengan responsif mobile.
[x] Sidebar mobile auto-close saat navlink ditekan.
[x] UserNav Dropdown: Profile, Settings, Logout.
[x] Setup NextAuth.js untuk autentikasi (Credentials provider & koneksi ke database).
[x] Buat proxy Next.js (menggantikan middleware) untuk memproteksi seluruh route /dashboard.
[x] Hash password dengan bcrypt pada register & validasi pada login.

Phase 3: Core Cashflow (Pemasukan & Pengeluaran)
[x] Buat komponen Global Transaction Modal (dikendalikan via Zustand).
[x] Form transaksi: Nominal, Tipe (Pemasukan/Pengeluaran), Dropdown Kategori, Tanggal, Catatan.
[x] Buat halaman History (/dashboard/history) berupa tabel transaksi.
[x] Buat database seeder (script/logic) untuk kategori default per user.
[x] Buat Server Actions: createTransaction, getTransactions, deleteTransaction.
[x] Sambungkan Transaction Modal & History Table ke Server Actions (ganti mock data).
[x] Filter transaksi berdasarkan bulan/tahun.

Phase 4: Dashboard & Visual Charts
[x] Buat Summary Cards di halaman /dashboard.
[x] Integrasikan Recharts: Donut Chart (Expense Breakdown per kategori).
[x] Integrasikan Recharts: Bar Chart (Cashflow Trend per hari dalam bulan).
[x] Buat Server Action getDashboardSummary: Total Saldo, Pemasukan, Pengeluaran bulan ini.
[x] Sambungkan Summary Cards & Charts ke Server Actions.

Phase 5: Savings Tracker (Fitur Menabung)
[x] Buat halaman /dashboard/savings.
[x] Buat form modal untuk menambah target tabungan.
[x] Visualisasi UI Progress Bar (shadcn Progress) pada halaman savings & dashboard widget.
[x] Buat Server Action untuk CRUD SavingGoal.
[x] Core Logic Integrasi: saat transaksi kategori "Tabungan" dibuat, tambahkan nominal ke currentAmount SavingGoal terkait.
[x] Sambungkan halaman savings ke Server Actions.

Phase 6: UI/UX Polish & Vibe Check
[x] Tampilan mobile-first responsif (sidebar drawer, chart menyesuaikan lebar, bottom padding untuk FAB).
[x] Sonner/toast siap dipakai untuk notifikasi aksi CRUD.
[x] UserNav Dropdown untuk Profile/Logout.
[x] Terapkan Loading Skeletons pada Dashboard cards dan charts saat data di-fetch.
[x] Tambahkan toast notifikasi sukses/gagal pada setiap aksi CRUD (create/delete transaction, save goal).
[x] Refactor: ganti semua mock data dengan real data dari Server Actions.

Phase 7: Feature Enhancement (Edit, Savings Deposit, Profile, Filter)
[x] Feature 1 — Edit Transaksi:
  [x] Tambah Server Action: updateTransaction(id, data).
  [x] Buat komponen EditTransactionModal.tsx (form prefilled, submit ke updateTransaction).
  [x] Tambah tombol Edit di setiap baris TransactionTable (hover reveal, di samping Delete).

[x] Feature 2 — Savings Deposit & CRUD Goal:
  [x] Update schema Prisma: tambah model SavingDeposit (id, savingGoalId, amount, note, date).
  [x] Jalankan prisma db push untuk sinkronisasi schema baru.
  [x] Tambah Server Actions: depositToSavingGoal, updateSavingGoal, deleteSavingGoal, getSavingDeposits.
  [x] Buat komponen DepositModal.tsx (input nominal + catatan + tanggal, submit ke depositToSavingGoal).
  [x] Buat komponen EditGoalModal.tsx (edit nama & target amount).
  [x] Update SavingGoalCard: tambah tombol Setor Dana, Edit, dan Hapus.
  [x] Logika Integrasi Saldo: saat deposit, otomatis buat transaksi tipe EXPENSE (kategori Tabungan) agar Saldo Utama berkurang.

[x] Feature 3 — Halaman Profile & Settings:
  [x] Tambah Server Actions: updateProfile(name, email), changePassword(current, new).
  [x] Buat halaman /dashboard/profile (form edit nama & email, tampilkan avatar).
  [x] Buat halaman /dashboard/settings (form ganti password, preferensi app).
  [x] Update UserNav: tampilkan nama & email asli dari session, fix link ke /dashboard/profile dan /dashboard/settings.
  [x] Update Sidebar: tambah link navigasi ke Profile & Settings.

[x] Feature 4 — Integrasi Filter Bulan/Tahun ke URL:
  [x] Update MonthFilter: gunakan useRouter + useSearchParams untuk push ?month=X&year=Y ke URL.
  [x] Hapus filter state dari Zustand (useAppStore), pertahankan hanya transactionModal.
  [x] Pastikan dashboard page, history page, dan savings page membaca filter dari searchParams URL.

Phase 8: Global Filter Enhancement (Month/Year Filter Fix)
[x] Fix Filter Persistence saat navigasi antar halaman:
  [x] Update Sidebar.tsx: setiap navlink menyertakan searchParams aktif (?month=X&year=Y) agar filter tidak ter-reset.
  [x] Fix dashboard/page.tsx & history/page.tsx: await searchParams sebagai Promise (Next.js 16 async API).
  [x] Verifikasi: npm run build sukses exit code 0, semua halaman terdaftar sebagai Dynamic (ƒ).
  [x] Verifikasi: Ganti bulan di Dashboard → pindah ke Riwayat → filter tetap sama.

Phase 9: Budget Allocation & Category Customization
[x] Schema Prisma: model Budget, relasi User/Category, UUID konsisten untuk Transaction, SavingGoal, dan SavingDeposit.
[x] Sinkronisasi Neon: tabel budgets dan unique constraint userId/categoryId/month/year tersedia tanpa reset data.
[x] Category Server Actions: query, create, update, delete dengan autentikasi, validasi, dan ownership check.
[x] Halaman /dashboard/categories: tab pemasukan/pengeluaran, tambah, edit, dan hapus kategori.
[x] Budget Server Actions: upsert alokasi dan progress pengeluaran per kategori/bulan.
[x] Halaman /dashboard/budgets: progress, sisa alokasi, status normal/peringatan/melewati batas, dan modal setel alokasi.
[x] Sidebar: menu Kategori dan Budget; filter bulan/tahun dipertahankan pada halaman Budget.
[x] Integrasi transaksi: kategori live dari database dan mutasi transaksi merevalidasi dashboard budget.
[x] Verifikasi: prisma validate, Prisma Client standard generate, TypeScript noEmit, dan db push sukses; koneksi PostgreSQL serta delegate/tabel db.budget terverifikasi lewat query baca-saja. Jika client schema berubah saat Next dev hidup, restart server dev sebelum menguji route terkait. Build webpack melewati kompilasi, TypeScript, serta generasi 11 halaman; finalisasi build tidak mengembalikan exit bersih di environment agent. Turbopack ditolak OS saat spawn proses.

Phase 10: Savings Summary & Total Pencapaian Tracking
[x] Ringkasan Total Tabungan Terkumpul, Tercapai & Belum Tercapai:
  [x] Halaman /dashboard/savings:
    - Ditambahkan 3 Kartu Ringkasan (Summary Cards) di bagian atas:
      1. Total Tabungan Terkumpul (akumulasi nominal terkumpul seluruh target beserta persentase terhadap total target).
      2. Total Telah Tercapai (jumlah target tercapai dan total nominal tabungan yang sukses diselesaikan).
      3. Total Belum Tercapai / Target Aktif (jumlah target aktif, total nominal terkumpul, total target, serta sisa dana yang masih harus ditabung).
    - Header sub-bagian "Target Belum Tercapai (Aktif)" dan "Target Telah Tercapai" kini menyertakan rincian teks total nominal (terkumpul, target, sisa).
  [x] Widget Dashboard (SavingGoalsWidget):
    - Ditambahkan badge ringkasan total nominal dan jumlah target untuk status "Tercapai" dan "Belum Tercapai" pada header widget dashboard.
  [x] Verifikasi: TypeScript noEmit sukses tanpa error.


Phase 11: Bug Fix — History Filter Timezone (WIB / UTC+7)
[x] Root Cause: Transaksi yang diinput di browser WIB (UTC+7) tersimpan di DB sebagai UTC (misal: 1 Okt 00:00 WIB = 30 Sep 17:00 UTC). Query batas tanggal yang menggunakan `new Date(year, month-1, 1)` menghasilkan batas UTC yang salah, sehingga transaksi awal bulan tidak masuk ke hasil filter bulan ini.
[x] Fix: Semua query batas tanggal bulanan kini menggunakan offset WIB secara eksplisit.
[x] Files yang diupdate:
  - lib/actions/transaction.actions.ts — getTransactions()
  - lib/actions/dashboard.actions.ts — getDashboardSummary(), getExpenseBreakdown(), getCashflowTrend()
  - lib/actions/budget.actions.ts — getBudgetsProgress()
[x] getCashflowTrend: Loop grouping kini mengkonversi UTC → WIB (+7 jam) sebelum mengambil tanggal, agar chart trend per hari akurat.
[x] Helper getMonthBoundsWIB() ditambahkan di dashboard.actions.ts untuk menghindari duplikasi kode.

