"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CashflowTrendChart({ data }: { data: any[] }) {
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (
    <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm shadow-slate-200 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">Tren Pemasukan & Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[250px] sm:h-[300px] w-full mt-4 flex items-center justify-center text-slate-500 text-sm">
            Belum ada transaksi bulan ini.
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => value / 1000 + "k"}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => "Tanggal " + label}
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
