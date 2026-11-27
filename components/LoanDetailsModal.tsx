'use client';

import React from 'react';
import {
  X,
  Calendar,
  CreditCard,
  FileText,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { LoanEntry } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanEntry | null;
  onOpenPaymentModal: (loan: LoanEntry) => void;
  onEdit: (loan: LoanEntry) => void;
  onDelete: (id: string) => void;
}

export function LoanDetailsModal({
  isOpen,
  onClose,
  loan,
  onOpenPaymentModal,
  onEdit,
  onDelete,
}: LoanDetailsModalProps) {
  if (!isOpen || !loan) return null;

  const isLent = loan.type === 'lent';
  const principal = Number(loan.amount) || 0;
  const paid = Number(loan.paidAmount) || 0;
  const remaining = Math.max(0, principal - paid);
  const percent = principal > 0 ? Math.min(100, Math.round((paid / principal) * 100)) : 0;
  const isSettled = loan.status === 'settled' || remaining === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isLent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {isLent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{loan.personName}</h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {isLent ? 'Borrower (Money Lent / পাওনা)' : 'Lender (Money Borrowed / দেনা)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Balance & Progress */}
        <div className="my-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isLent ? 'Remaining to Receive' : 'Remaining to Pay'}
              </span>
              <p className={`text-2xl font-black ${isSettled ? 'text-slate-400 line-through' : isLent ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatAmount(remaining)}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                isSettled
                  ? 'bg-emerald-100 text-emerald-800'
                  : paid > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isSettled ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Settled</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="text-amber-600" />
                    <span>{paid > 0 ? (isLent ? 'Partially Received' : 'Partially Repaid') : 'Pending'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>{isLent ? 'Received' : 'Repaid'}: {formatAmount(paid)}</span>
              <span>Total: {formatAmount(principal)} ({percent}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSettled ? 'bg-emerald-600' : isLent ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loan Details Meta */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" /> Date Given / Taken
            </span>
            <span className="font-mono font-bold text-slate-800">{loan.date}</span>
          </div>

          {loan.dueDate && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" /> Target Return Date
              </span>
              <span className="font-mono font-bold text-amber-700">{loan.dueDate}</span>
            </div>
          )}

          {loan.paymentMethod && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <CreditCard size={13} className="text-slate-400" /> Payment Method
              </span>
              <span className="font-semibold text-slate-800 bg-slate-100 rounded-md px-2 py-0.5 text-[11px]">
                {loan.paymentMethod}
              </span>
            </div>
          )}

          {loan.note && (
            <div className="py-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <FileText size={13} className="text-slate-400" /> Note
              </span>
              <p className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 italic border border-slate-100">
                {loan.note}
              </p>
            </div>
          )}
        </div>

        {/* Payment History List */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isLent ? 'Received / Collections' : 'Repayment History'} ({loan.payments?.length || 0})
            </span>
            {!isSettled && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(loan);
                }}
                className={`text-[11px] font-bold hover:underline flex items-center gap-1 ${
                  isLent ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-600 hover:text-rose-700'
                }`}
              >
                <Plus size={12} />
                <span>{isLent ? 'Record Received' : 'Record Repayment'}</span>
              </button>
            )}
          </div>

          {loan.payments && loan.payments.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {loan.payments.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs border border-slate-100"
                >
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block">{p.date}</span>
                    {p.note && <span className="text-slate-600 text-[11px]">{p.note}</span>}
                  </div>
                  <span className={`font-extrabold ${isLent ? 'text-emerald-700' : 'text-teal-700'}`}>
                    +{formatAmount(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-3 text-xs text-slate-400 italic bg-slate-50 rounded-xl">
              {isLent ? 'No received records yet.' : 'No repayment records yet.'}
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(loan);
              }}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
              title="Edit Loan"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(loan.id);
              }}
              className="flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition active:scale-95"
              title="Delete Loan"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>

          {!isSettled ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPaymentModal(loan);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                isLent
                  ? 'bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700'
                  : 'bg-rose-600 shadow-rose-600/25 hover:bg-rose-700'
              }`}
            >
              <Plus size={14} />
              <span>{isLent ? '+ Record Received' : '+ Record Repayment'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

