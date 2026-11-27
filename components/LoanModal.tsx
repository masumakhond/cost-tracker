'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, HandCoins, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { LoanEntry, LoanType } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/constants';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<LoanEntry, 'id' | 'createdAt' | 'paidAmount' | 'status' | 'payments'>) => void;
  initialData?: LoanEntry | null;
}

export function LoanModal({ isOpen, onClose, onSave, initialData }: LoanModalProps) {
  const [type, setType] = useState<LoanType>('lent');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setPersonName(initialData.personName);
      setAmount(String(initialData.amount));
      setDate(initialData.date);
      setDueDate(initialData.dueDate || '');
      setPaymentMethod(initialData.paymentMethod || 'Cash');
      setNote(initialData.note || '');
    } else {
      setType('lent');
      setPersonName('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setPaymentMethod('Cash');
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      type,
      personName: personName.trim(),
      amount: parsedAmount,
      date,
      dueDate: dueDate.trim() || undefined,
      paymentMethod,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              type === 'lent' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <HandCoins size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {initialData ? 'Edit Loan Record' : 'Record New Loan / Debt'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Loan Direction Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Loan Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('lent')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition active:scale-98 ${
                  type === 'lent'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600 ring-offset-1'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowUpRight size={16} />
                <span>I Lent (Borrower owes me)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('borrowed')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition active:scale-98 ${
                  type === 'borrowed'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-600 ring-offset-1'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowDownLeft size={16} />
                <span>I Borrowed (I owe Lender)</span>
              </button>
            </div>
          </div>

          {/* Person Name & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {type === 'lent' ? "Borrower's Name *" : "Lender's Name *"}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={type === 'lent' ? 'e.g. Asif, Tanvir, Brother...' : 'e.g. Rahim Bhai, Sonali Bank...'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Principal Amount (৳) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-slate-400">৳</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-lg font-extrabold text-slate-900 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>
            </div>
          </div>

          {/* Date & Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Given / Taken Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target Return Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Transfer / Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Emergency medical help, Promised by next month..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 ${
                type === 'lent'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              }`}
            >
              <Check size={18} />
              <span>{initialData ? 'Save Changes' : 'Save Loan Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
