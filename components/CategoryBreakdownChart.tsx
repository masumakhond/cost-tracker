'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySummary } from '@/lib/types';
import { formatAmount } from '@/lib/utils';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryBreakdownChartProps {
  categories: CategorySummary[];
}

export function CategoryBreakdownChart({ categories }: CategoryBreakdownChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-6 text-center">
        <PieIcon size={32} className="text-slate-300" />
        <p className="mt-2 text-xs font-semibold text-slate-500">No expenses recorded for this month yet.</p>
      </div>
    );
  }

  const chartData = categories.map((c) => ({
    name: c.category.label.split('(')[0].trim(),
    value: c.amount,
    color: c.category.color,
  }));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
        Expense Breakdown by Category
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="h-44 w-44 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: any) => [formatAmount(Number(val)), 'Amount']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Pie
                data={chartData}
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Progress list */}
        <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((c) => (
            <div key={c.category.id} className="text-xs">
              <div className="flex items-center justify-between font-medium">
                <div className="flex items-center gap-2 truncate max-w-[180px]">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: c.category.color }}
                  />
                  <span className="truncate text-slate-700">{c.category.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatAmount(c.amount)}</span>
                  <span className="text-[11px] font-semibold text-slate-400">({c.percentage}%)</span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.category.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

