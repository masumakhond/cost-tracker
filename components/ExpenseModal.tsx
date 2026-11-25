'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, CreditCard } from 'lucide-react';
import { ExpenseEntry, ExpenseCategory, SpenderType, PaymentMethodType } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/constants';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseEntry, 'id'>) => void;
  initialData?: ExpenseEntry | null;
  categories: ExpenseCategory[];
  currentMonthId: string;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  currentMonthId,
}: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(`${currentMonthId}-01`);
  const [category, setCategory] = useState(categories[0]?.id || 'groceries');
  const [spentBy, setSpentBy] = useState<SpenderType>('Masum');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(String(initialData.amount));
      setDate(initialData.date);
      setCategory(initialData.category);
      setSpentBy(initialData.spentBy);
      setPaymentMethod(initialData.paymentMethod);
      setNote(initialData.note || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTitle('');
      setAmount('');
      setDate(today.startsWith(currentMonthId) ? today : `${currentMonthId}-01`);
      setCategory(categories[0]?.id || 'groceries');
      setSpentBy('Masum');
      setPaymentMethod('Cash');
      setNote('');
    }
  }, [initialData, isOpen, currentMonthId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      monthId: date.slice(0, 7),
      date,
      title: title.trim(),
      amount: parsedAmount,
      category,
      spentBy,
      paymentMethod,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {initialData ? 'Edit Expense Entry' : 'Add New Expense'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Expense Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Grocery, DESCO Bill..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Amount (৳) *
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

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date *
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
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Spender & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Spent By *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Masum', 'Toyeeba', 'Shared'] as SpenderType[]).map((person) => (
                  <button
                    key={person}
                    type="button"
                    onClick={() => setSpentBy(person)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                      spentBy === person
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 ring-2 ring-teal-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
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
              placeholder="e.g. Paid via bKash, invoice saved..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/30 hover:bg-teal-700 transition active:scale-95"
            >
              <Check size={18} />
              <span>{initialData ? 'Save Changes' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
