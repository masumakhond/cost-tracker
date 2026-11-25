'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Palette } from 'lucide-react';
import { ExpenseCategory } from '@/lib/types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  onAddCategory: (newCategory: ExpenseCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
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

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const id = `custom-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const newCat: ExpenseCategory = {
      id,
      label: label.trim(),
      englishLabel: label.trim(),
      color,
      icon: 'Tag',
      isCustom: true,
    };

    onAddCategory(newCat);
    setLabel('');
    setColor(COLOR_OPTIONS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto pb-[env(safe-area-inset-bottom,20px)] sm:pb-6">
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Palette size={20} className="text-teal-600" />
            <h3 className="text-base font-bold">Customize Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gym & Fitness, Pet Care..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Choose Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 sm:h-7 sm:w-7 rounded-full transition-all active:scale-90 ${
                    color === c ? 'scale-115 ring-3 ring-slate-900 ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/30 hover:bg-teal-700 transition active:scale-95"
          >
            <Plus size={18} /> Add Category
          </button>
        </form>

        {/* Category List */}
        <div className="mt-5 border-t border-slate-100 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Active Categories ({categories.length})
          </h4>
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-slate-700">{cat.label}</span>
                  {cat.isCustom && (
                    <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                      Custom
                    </span>
                  )}
                </div>

                {cat.isCustom && (
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-90"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
