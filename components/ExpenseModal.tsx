'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, CreditCard, Plus, Sparkles } from 'lucide-react';
import { ExpenseEntry, ExpenseCategory, SpenderType, PaymentMethodType } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/constants';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseEntry, 'id'>) => void;
  initialData?: ExpenseEntry | null;
  categories: ExpenseCategory[];
  currentMonthId: string;
  onAddCategory?: (category: ExpenseCategory) => void;
}

const COLOR_OPTIONS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#14b8a6', // teal
  '#64748b', // slate
];

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  currentMonthId,
  onAddCategory,
}: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(`${currentMonthId}-01`);
  const [category, setCategory] = useState(categories[0]?.id || 'groceries');
  const [spentBy, setSpentBy] = useState<SpenderType>('Masum');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [note, setNote] = useState('');

  // Inline custom category creation states
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (!isOpen) {
      setIsCreatingCustom(false);
      setCustomCategoryName('');
      return;
    }

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
    setIsCreatingCustom(false);
    setCustomCategoryName('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

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

  const handleSaveCustomCategory = () => {
    const trimmed = customCategoryName.trim();
    if (!trimmed) return;

    const id = `custom-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const newCat: ExpenseCategory = {
      id,
      label: trimmed,
      englishLabel: trimmed,
      color: customCategoryColor,
      icon: 'Tag',
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCat);
    }
    setCategory(id);
    setIsCreatingCustom(false);
    setCustomCategoryName('');
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Category *
                </label>
                {!isCreatingCustom && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(true)}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 hover:underline"
                  >
                    <Plus size={12} />
                    <span>Custom</span>
                  </button>
                )}
              </div>

              <select
                value={isCreatingCustom ? '__custom__' : category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCreatingCustom(true);
                  } else {
                    setCategory(e.target.value);
                    setIsCreatingCustom(false);
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
                <option value="__custom__" className="font-bold text-teal-700">
                  ✨ + Custom Category...
                </option>
              </select>
            </div>
          </div>

          {/* Inline Custom Category Creator Card */}
          {isCreatingCustom && (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-teal-600" />
                  Create Custom Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-teal-100 hover:text-slate-600 transition"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <input
                type="text"
                autoFocus
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveCustomCategory();
                  }
                }}
                placeholder="Category name (e.g. Internet, Gym, Pet Care)..."
                className="w-full rounded-xl border border-teal-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
              />

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-900/70 mb-1.5">
                  Select Color Accent
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomCategoryColor(c)}
                      className={`h-6 w-6 rounded-full transition-transform active:scale-90 ${
                        customCategoryColor === c
                          ? 'ring-2 ring-teal-600 ring-offset-2 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-teal-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setCustomCategoryName('');
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomCategory}
                  disabled={!customCategoryName.trim()}
                  className="flex items-center gap-1 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition active:scale-95 disabled:opacity-50"
                >
                  <Plus size={13} />
                  <span>Add & Select</span>
                </button>
              </div>
            </div>
          )}

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

          {/* Action Buttons: Cancel has compact width, Save has proper padding */}
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-95"
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
