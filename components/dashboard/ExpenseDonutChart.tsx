"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function ExpenseDonutChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 border-0 shadow-sm shadow-slate-200 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[250px] sm:h-[300px] w-full mt-4 flex items-center justify-center text-slate-500 text-sm">
            Belum ada pengeluaran bulan ini.
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="categoryName"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
