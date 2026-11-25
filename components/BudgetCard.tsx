'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Monthly Budget</h3>
            <p className="text-xs text-slate-500">Expense spending target</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputVal(String(budgetLimit || 50000));
            setIsEditing(!isEditing);
          }}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition"
        >
          <Edit3 size={13} />
          <span>{hasBudget ? 'Edit Target' : 'Set Budget'}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
            <input
              type="number"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">{formatAmount(totalSpent)}</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">
                of {hasBudget ? formatAmount(budgetLimit) : 'No limit set'}
              </span>
            </div>
            <div className="text-right">
              {hasBudget && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    isOverBudget ? 'text-rose-600' : percentage > 80 ? 'text-amber-600' : 'text-teal-600'
                  }`}
                >
                  {isOverBudget ? (
                    <>
                      <AlertTriangle size={14} /> Over by {formatAmount(overAmount)}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> {formatAmount(remaining)} left
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {hasBudget && (
            <div className="mt-2.5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
                  style={{ width: `${Math.min(100, (totalSpent / budgetLimit) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                <span>{percentage}% utilized</span>
                <span>Limit: {formatAmount(budgetLimit)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

