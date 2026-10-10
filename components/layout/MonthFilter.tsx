"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function MonthFilterInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const selectedMonth = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString());
  const selectedYear = parseInt(searchParams.get("year") || currentYear.toString());

  const pushFilter = useCallback(
    (month: number, year: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", month.toString());
      params.set("year", year.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          if (val) pushFilter(parseInt(val), selectedYear);
        }}
        items={MONTHS.map((m, idx) => ({ value: (idx + 1).toString(), label: m }))}
      >
        <SelectTrigger className="w-[110px] sm:w-[140px] bg-white border-slate-200 shadow-sm rounded-xl">
          <SelectValue placeholder="Bulan">{MONTHS[selectedMonth - 1]}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {MONTHS.map((month, idx) => (
            <SelectItem key={idx} value={(idx + 1).toString()} className="rounded-lg">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => {
          if (val) pushFilter(selectedMonth, parseInt(val));
        }}
        items={years.map((year) => ({ value: year.toString(), label: year.toString() }))}
      >
        <SelectTrigger className="w-[85px] sm:w-[100px] bg-white border-slate-200 shadow-sm rounded-xl">
          <SelectValue placeholder="Tahun">{selectedYear}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="rounded-lg">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MonthFilter() {
  return (
    <Suspense fallback={<div className="h-10 w-[200px] sm:w-[248px] bg-slate-100 animate-pulse rounded-xl" />}>
      <MonthFilterInner />
    </Suspense>
  );
}
