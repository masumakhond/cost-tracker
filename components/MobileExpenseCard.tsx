'use client';

import React, { useState } from 'react';
import { Eye, Edit2, Trash2, X, Calendar, CreditCard, Tag, User, FileText } from 'lucide-react';
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
  const [showDetails, setShowDetails] = useState(false);

  const catColor = category?.color || '#0d9488';
  const catName = category?.englishLabel || category?.label.split('(')[0].trim() || entry.category;

  return (
    <>
      {/* Compact Expense Card (Reduced Height) */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-xs transition hover:border-slate-300">
        {/* Left: Category Color Dot + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: catColor }}
            title={catName}
          />
          <h4
            onClick={() => setShowDetails(true)}
            className="text-xs sm:text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-teal-700 transition"
            title={entry.title}
          >
            {entry.title}
          </h4>
        </div>

        {/* Right: Amount + Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
            {formatAmount(entry.amount)}
          </span>

          {/* Action Buttons: View, Edit, Delete */}
          <div className="flex items-center gap-1">
            {/* 1. Eye Icon: View Full Card */}
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 active:scale-90 transition"
              title="View Full Card"
            >
              <Eye size={14} />
            </button>

            {/* 2. Pen Icon: Edit */}
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-90 transition"
              title="Edit Expense"
            >
              <Edit2 size={13} />
            </button>

            {/* 3. Trash Icon: Delete */}
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90 transition"
              title="Delete Expense"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Card Details Modal (Opens on Eye Icon Click) */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
            {/* Mobile Pull Handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <Tag size={18} style={{ color: catColor }} />
                <h3 className="text-base font-bold">Expense Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Amount Hero */}
            <div className="my-4 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Total Amount
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {formatAmount(entry.amount)}
              </p>
            </div>

            {/* Detailed Properties Grid */}
            <div className="space-y-3 text-xs">
              {/* Title */}
              <div className="flex items-start justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Expense Title</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px]">
                  {entry.title}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Tag size={13} className="text-slate-400" />
                  Category
                </span>
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
                  <span>{catName}</span>
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  Date
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {entry.date}
                </span>
              </div>

              {/* Spent By */}
              <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  Spent By
                </span>
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
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

              {/* Payment Method */}
              <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <CreditCard size={13} className="text-slate-400" />
                  Payment Method
                </span>
                <span className="font-bold text-slate-800 bg-slate-100 rounded-lg px-2 py-0.5 text-[11px]">
                  {entry.paymentMethod}
                </span>
              </div>

              {/* Note */}
              <div className="py-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <FileText size={13} className="text-slate-400" />
                  Note
                </span>
                <p className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 italic border border-slate-100">
                  {entry.note ? entry.note : 'No notes provided.'}
                </p>
              </div>
            </div>

            {/* Actions in Full View Modal */}
            <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetails(false);
                  onEdit(entry);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-95"
              >
                <Edit2 size={13} />
                <span>Edit Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
