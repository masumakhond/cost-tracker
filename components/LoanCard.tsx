'use client';

import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { LoanEntry } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface LoanCardProps {
  loan: LoanEntry;
  onOpenDetails: (loan: LoanEntry) => void;
  onOpenPayment: (loan: LoanEntry) => void;
  onEdit: (loan: LoanEntry) => void;
  onDelete: (id: string) => void;
}

export function LoanCard({
  loan,
  onOpenDetails,
  onOpenPayment,
  onEdit,
  onDelete,
}: LoanCardProps) {
  const isLent = loan.type === 'lent';
  const principal = Number(loan.amount) || 0;
  const paid = Number(loan.paidAmount) || 0;
  const remaining = Math.max(0, principal - paid);
  const percent = principal > 0 ? Math.min(100, Math.round((paid / principal) * 100)) : 0;
  const isSettled = loan.status === 'settled' || remaining === 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs transition hover:border-slate-300">
      {/* Top Row: Type Pill, Person Name, and Due / Principal */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isLent
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isLent ? (
                <>
                  <ArrowUpRight size={11} />
                  <span>I Lent (Borrower)</span>
                </>
              ) : (
                <>
                  <ArrowDownLeft size={11} />
                  <span>I Borrowed (Lender)</span>
                </>
              )}
            </span>

            {isSettled ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>Settled</span>
              </span>
            ) : paid > 0 ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                {percent}% Paid
              </span>
            ) : null}
          </div>

          <h4
            onClick={() => onOpenDetails(loan)}
            className="mt-1 text-sm sm:text-base font-bold text-slate-900 truncate cursor-pointer hover:text-teal-700 transition"
          >
            {loan.personName}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1 font-mono">
              <Calendar size={11} />
              {loan.date}
            </span>
            {loan.dueDate && !isSettled && (
              <span className="text-amber-700 font-medium">Due: {loan.dueDate}</span>
            )}
          </div>
        </div>

        {/* Right: Amounts */}
        <div className="text-right flex-shrink-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isSettled ? 'Paid Off' : 'Remaining Due'}
          </span>
          <span
            className={`text-sm sm:text-base font-black tracking-tight ${
              isSettled
                ? 'text-slate-400 line-through'
                : isLent
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {formatAmount(isSettled ? principal : remaining)}
          </span>
          {!isSettled && paid > 0 && (
            <span className="block text-[10px] text-slate-400 font-medium">
              of {formatAmount(principal)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (if partial) */}
      {!isSettled && paid > 0 && (
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${isLent ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        {/* Left: Quick Payment button */}
        {!isSettled ? (
          <button
            type="button"
            onClick={() => onOpenPayment(loan)}
            className="flex items-center gap-1 rounded-xl bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition active:scale-95"
          >
            <Plus size={13} className="text-teal-700" />
            <span>+ Payment</span>
          </button>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 italic">
            Closed on time
          </span>
        )}

        {/* Right: 3 Standard Icons (Eye, Pen, Trash) */}
        <div className="flex items-center gap-1">
          {/* Eye Icon */}
          <button
            type="button"
            onClick={() => onOpenDetails(loan)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 active:scale-90 transition"
            title="View Full Details"
          >
            <Eye size={14} />
          </button>

          {/* Pen Icon */}
          <button
            type="button"
            onClick={() => onEdit(loan)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-90 transition"
            title="Edit Record"
          >
            <Edit2 size={13} />
          </button>

          {/* Trash Icon */}
          <button
            type="button"
            onClick={() => onDelete(loan.id)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90 transition"
            title="Delete Record"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
