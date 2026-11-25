'use client';

import React from 'react';
import { Edit2, Trash2, Calendar, CreditCard, Tag } from 'lucide-react';
import { ExpenseEntry, ExpenseCategory } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface MobileExpenseCardProps {
  entry: ExpenseEntry;
  category?: ExpenseCategory;
  onEdit: (entry: ExpenseEntry) => void;
  onDelete: (id: string) => void;
}

export function MobileExpenseCard({
  entry,
  category,
  onEdit,
  onDelete,
}: MobileExpenseCardProps) {
  const catColor = category?.color || '#0d9488';
  const catName = category?.englishLabel || category?.label.split('(')[0].trim() || entry.category;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
      {/* Top Header: Date, Category Pill, Spender */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono text-slate-400 font-medium">
          {entry.date}
        </span>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Category Pill */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: `${catColor}15`,
              color: catColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            <span className="truncate max-w-[120px]">{catName}</span>
          </span>

          {/* Spender Badge */}
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
              entry.spentBy === 'Masum'
                ? 'bg-teal-50 text-teal-700'
                : entry.spentBy === 'Toyeeba'
                ? 'bg-pink-50 text-pink-700'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {entry.spentBy}
          </span>
        </div>
      </div>

      {/* Main Content: Title & Note */}
      <div className="mt-2.5">
        <h4 className="text-base font-bold text-slate-900 leading-snug">
          {entry.title}
        </h4>
        {entry.note && (
          <p className="mt-0.5 text-xs text-slate-500 italic">
            {entry.note}
          </p>
        )}
      </div>

      {/* Bottom Footer: Payment Method, Amount, Actions */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-lg px-2 py-1">
            <CreditCard size={12} className="text-slate-400" />
            <span>{entry.paymentMethod}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-base font-black text-slate-900">
            {formatAmount(entry.amount)}
          </span>

          {/* Touch-Friendly Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-90 transition"
              title="Edit Expense"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90 transition"
              title="Delete Expense"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

