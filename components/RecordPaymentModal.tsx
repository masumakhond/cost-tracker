'use client';

import React, { useState } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { LoanEntry, LoanPayment } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanEntry | null;
  onSavePayment: (loanId: string, payment: Omit<LoanPayment, 'id'>, isFullSettlement: boolean) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  loan,
  onSavePayment,
}: RecordPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [markSettled, setMarkSettled] = useState(false);

  if (!isOpen || !loan) return null;

  const principal = Number(loan.amount) || 0;
  const currentPaid = Number(loan.paidAmount) || 0;
  const remaining = Math.max(0, principal - currentPaid);

  const isLent = loan.type === 'lent'; // Money I gave, now receiving back
  const titleText = isLent ? 'Record Payment Received' : 'Record Repayment Made';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const willBeSettled = markSettled || currentPaid + parsedAmount >= principal;

    onSavePayment(
      loan.id,
      {
        date,
        amount: parsedAmount,
        note: note.trim() || undefined,
      },
      willBeSettled
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isLent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {isLent ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{titleText}</h3>
              <p className="text-[11px] text-slate-400 font-medium">{loan.personName}</p>
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

        {/* Current Balance Banner */}
        <div className="my-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Principal</span>
            <span className="font-bold text-slate-700">{formatAmount(principal)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Remaining Due</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatAmount(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Payment Amount (৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base text-slate-400">৳</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                autoFocus
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (val >= remaining) {
                    setMarkSettled(true);
                  }
                }}
                placeholder={String(remaining)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-4 text-base font-extrabold text-slate-900 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
            <div className="mt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setPaymentAmount(String(remaining));
                  setMarkSettled(true);
                }}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Pay Full Remaining ({formatAmount(remaining)})
              </button>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          {/* Payment Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 1st installment, paid via bKash..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          {/* Mark Settled Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={markSettled}
              onChange={(e) => setMarkSettled(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <span>Mark loan as fully settled / closed</span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-95"
            >
              <Check size={16} />
              <span>Confirm Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

