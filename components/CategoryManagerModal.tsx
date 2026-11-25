'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Palette } from 'lucide-react';
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
      color,
      icon: 'Tag',
      isCustom: true,
    };

    onAddCategory(newCat);
    setLabel('');
    setColor(COLOR_OPTIONS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Palette size={20} className="text-teal-600" />
            <h3 className="text-base font-bold">Customize Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gym & Fitness, Pet Care..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Choose Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition active:scale-98"
          >
            <Plus size={16} /> Add Category
          </button>
        </form>

        {/* Category List */}
        <div className="mt-5 border-t border-slate-100 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Active Categories ({categories.length})
          </h4>
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
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
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
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

