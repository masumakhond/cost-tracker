'use client';

import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
import { formatAmount } from '@/lib/utils';

interface BudgetCardProps {
  totalSpent: number;
  budgetLimit: number;
  onUpdateBudget: (newLimit: number) => void;
}

export function BudgetCard({ totalSpent, budgetLimit, onUpdateBudget }: BudgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(budgetLimit || 50000));

  const hasBudget = budgetLimit > 0;
  const percentage = hasBudget ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;
  const remaining = Math.max(0, budgetLimit - totalSpent);
  const isOverBudget = hasBudget && totalSpent > budgetLimit;
  const overAmount = totalSpent - budgetLimit;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputVal) || 0;
    onUpdateBudget(parsed);
    setIsEditing(false);
  };

  const getStatusColor = () => {
    if (!hasBudget) return 'bg-slate-200';
    if (percentage > 95 || isOverBudget) return 'bg-rose-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-teal-500';
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Target size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Monthly Budget</h3>
            <p className="text-xs text-slate-500">Spending target for this month</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputVal(String(budgetLimit || 50000));
            setIsEditing(!isEditing);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50 active:scale-95 transition"
        >
          <Edit3 size={13} />
          <span>{hasBudget ? 'Edit Target' : 'Set Budget'}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
            <input
              type="number"
              inputMode="decimal"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-3 text-base sm:text-sm font-bold text-slate-900 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none rounded-xl bg-teal-600 px-5 py-3 sm:py-2 text-xs font-bold text-white hover:bg-teal-700 active:scale-95 transition"
            >
              Save Target
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 px-4 py-3 sm:py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {formatAmount(totalSpent)}
              </span>
              <span className="text-xs font-medium text-slate-400 ml-2">
                of {hasBudget ? formatAmount(budgetLimit) : 'No limit set'}
              </span>
            </div>
            <div>
              {hasBudget && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    isOverBudget ? 'text-rose-600' : percentage > 80 ? 'text-amber-600' : 'text-teal-600'
                  }`}
                >
                  {isOverBudget ? (
                    <>
                      <AlertTriangle size={15} /> Over by {formatAmount(overAmount)}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> {formatAmount(remaining)} remaining
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {hasBudget && (
            <div className="mt-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
                  style={{ width: `${Math.min(100, (totalSpent / budgetLimit) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
                <span>{percentage}% of budget used</span>
                <span>Target: {formatAmount(budgetLimit)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
