'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Download,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Users,
  Wallet,
  Sparkles,
  Database,
  SlidersHorizontal,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  ExpenseEntry,
  ExpenseCategory,
  SpenderType,
  PaymentMethodType,
} from '@/lib/types';
import {
  MONTHS,
  YEARS,
  DEFAULT_CATEGORIES,
  PREFILLED_EXPENSES,
} from '@/lib/constants';
import {
  formatAmount,
  getCurrentYearMonth,
  monthLabel,
  buildSpenderSummary,
  buildCategorySummary,
} from '@/lib/utils';
import { downloadMonthlyCostPdf, downloadAnnualCostPdf } from '@/lib/pdf';
import { BudgetCard } from '@/components/BudgetCard';
import { CategoryBreakdownChart } from '@/components/CategoryBreakdownChart';
import { ExpenseModal } from '@/components/ExpenseModal';
import { CategoryManagerModal } from '@/components/CategoryManagerModal';

// Storage keys
const STORAGE_ENTRIES = 'cost-entries-v1';
const STORAGE_BUDGETS = 'cost-budgets-v1';
const STORAGE_CATEGORIES = 'cost-categories-v1';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const isCloudEnabled = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

const supabase = isCloudEnabled ? createClient(supabaseUrl!, supabaseKey!) : null;

export default function CostTrackerDashboard() {
  const currentYM = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentYM.month);

  // Core Data States
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [userName, setUserName] = useState('Admin');
  const [isLoaded, setIsLoaded] = useState(false);
  const [usingLocalFallback, setUsingLocalFallback] = useState(!isCloudEnabled);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSpender, setFilterSpender] = useState<string>('all');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const currentMonthId = `${selectedYear}-${selectedMonth}`;

  // Load user session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => undefined);
  }, []);

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      // Load Categories
      const savedCats = localStorage.getItem(STORAGE_CATEGORIES);
      if (savedCats) {
        try {
          setCategories(JSON.parse(savedCats));
        } catch {}
      }

      // Load Budgets
      const savedBudgets = localStorage.getItem(STORAGE_BUDGETS);
      if (savedBudgets) {
        try {
          setBudgets(JSON.parse(savedBudgets));
        } catch {}
      }

      // Check cloud or local storage
      if (isCloudEnabled && supabase) {
        try {
          const { data, error } = await supabase.from('expense_entries').select('*');
          if (!error && data) {
            const formatted: ExpenseEntry[] = data.map((item: any) => ({
              id: String(item.id),
              monthId: String(item.month_id),
              date: String(item.date).slice(0, 10),
              title: String(item.title),
              amount: Number(item.amount) || 0,
              category: String(item.category),
              spentBy: item.spent_by as SpenderType,
              paymentMethod: item.payment_method as PaymentMethodType,
              note: String(item.note || ''),
              isRecurring: Boolean(item.is_recurring),
            }));
            setEntries(formatted);
            localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(formatted));
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error('Cloud load failed, falling back to local storage', err);
        }
      }

      // Local storage fallback
      const saved = localStorage.getItem(STORAGE_ENTRIES);
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch {
          seedInitial();
        }
      } else {
        seedInitial();
      }
      setUsingLocalFallback(true);
      setIsLoaded(true);
    };

    const seedInitial = () => {
      const seeded: ExpenseEntry[] = PREFILLED_EXPENSES.map((e, idx) => ({
        ...e,
        id: `cost-${Date.now()}-${idx}`,
      }));
      setEntries(seeded);
      localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(seeded));
    };

    initData();
  }, []);

  // Persist entries locally
  const persistEntries = (next: ExpenseEntry[]) => {
    setEntries(next);
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(next));
  };

  // Month navigation
  const handlePrevMonth = () => {
    let m = parseInt(selectedMonth, 10) - 1;
    let y = parseInt(selectedYear, 10);
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedYear(String(y));
    setSelectedMonth(String(m).padStart(2, '0'));
  };

  const handleNextMonth = () => {
    let m = parseInt(selectedMonth, 10) + 1;
    let y = parseInt(selectedYear, 10);
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedYear(String(y));
    setSelectedMonth(String(m).padStart(2, '0'));
  };

  // Current Month Entries
  const monthEntries = useMemo(() => {
    return entries.filter((e) => e.monthId === currentMonthId || (e.date || '').startsWith(currentMonthId));
  }, [entries, currentMonthId]);

  // Filtered entries for table
  const displayedEntries = useMemo(() => {
    return monthEntries.filter((e) => {
      const matchSearch =
        !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.note.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      const matchSpender = filterSpender === 'all' || e.spentBy === filterSpender;
      return matchSearch && matchCat && matchSpender;
    });
  }, [monthEntries, searchQuery, filterCategory, filterSpender]);

  // Calculations
  const spenderSummary = useMemo(() => buildSpenderSummary(monthEntries), [monthEntries]);
  const categorySummary = useMemo(() => buildCategorySummary(monthEntries, categories), [monthEntries, categories]);
  const currentBudget = budgets[currentMonthId] || 50000;

  // Add / Edit Entry
  const handleSaveExpense = async (data: Omit<ExpenseEntry, 'id'>) => {
    if (editingExpense) {
      const updated = entries.map((e) => (e.id === editingExpense.id ? { ...data, id: editingExpense.id } : e));
      persistEntries(updated);

      if (isCloudEnabled && supabase) {
        await supabase
          .from('expense_entries')
          .update({
            month_id: data.monthId,
            date: data.date,
            title: data.title,
            amount: data.amount,
            category: data.category,
            spent_by: data.spentBy,
            payment_method: data.paymentMethod,
            note: data.note,
          })
          .eq('id', editingExpense.id);
      }
      setEditingExpense(null);
    } else {
      const newEntry: ExpenseEntry = {
        ...data,
        id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      const updated = [newEntry, ...entries];
      persistEntries(updated);

      if (isCloudEnabled && supabase) {
        await supabase.from('expense_entries').insert({
          id: newEntry.id,
          month_id: newEntry.monthId,
          date: newEntry.date,
          title: newEntry.title,
          amount: newEntry.amount,
          category: newEntry.category,
          spent_by: newEntry.spentBy,
          payment_method: newEntry.paymentMethod,
          note: newEntry.note,
        });
      }
    }
  };

  // Delete Entry
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const updated = entries.filter((e) => e.id !== id);
    persistEntries(updated);

    if (isCloudEnabled && supabase) {
      await supabase.from('expense_entries').delete().eq('id', id);
    }
  };

  // Update Budget
  const handleUpdateBudget = (newLimit: number) => {
    const updated = { ...budgets, [currentMonthId]: newLimit };
    setBudgets(updated);
    localStorage.setItem(STORAGE_BUDGETS, JSON.stringify(updated));
  };

  // Category Management
  const handleAddCategory = (newCat: ExpenseCategory) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Loading Cost Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">Cost Tracker</h1>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  Dynamic Ledger
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Masum & Toyeeba • {monthLabel(currentMonthId)}
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Customize expense categories"
            >
              <SlidersHorizontal size={14} className="text-teal-600" />
              <span>Categories</span>
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {userName.charAt(0)}
              </span>
              <span>{userName}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Month Selector Bar & Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          {/* Month & Year Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 active:scale-98"
            >
              <Plus size={16} />
              <span>Add Expense</span>
            </button>

            <button
              type="button"
              onClick={() => downloadMonthlyCostPdf(currentMonthId, monthEntries, categories)}
              disabled={monthEntries.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-98 disabled:opacity-50"
            >
              <Download size={14} className="text-teal-600" />
              <span>Month PDF</span>
            </button>

            <button
              type="button"
              onClick={() => downloadAnnualCostPdf(selectedYear, entries, categories)}
              disabled={entries.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-98 disabled:opacity-50"
            >
              <Calendar size={14} className="text-cyan-600" />
              <span>Year PDF</span>
            </button>
          </div>
        </div>

        {/* Sync Mode Notification Banner */}
        {usingLocalFallback && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-amber-600 flex-shrink-0" />
              <span>
                <strong>Local Storage Mode:</strong> Expenses are securely saved in browser memory. To enable live cloud sync, connect your Supabase credentials in <code>.env.local</code>.
              </span>
            </div>
            <span className="rounded-md bg-amber-200 px-2 py-0.5 font-bold text-amber-800 text-[10px]">
              Offline Ready
            </span>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Spent */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Expenses
              </span>
              <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                <Wallet size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {formatAmount(spenderSummary.total)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {monthEntries.length} items logged in {monthLabel(currentMonthId)}
            </p>
          </div>

          {/* Card 2: Masum's Share */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Masum's Expenses
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.masum / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {formatAmount(spenderSummary.masum)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Paid directly by Masum</p>
          </div>

          {/* Card 3: Toyeeba's Share */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Toyeeba's Expenses
              </span>
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.toyeeba / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {formatAmount(spenderSummary.toyeeba)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Paid directly by Toyeeba</p>
          </div>

          {/* Card 4: Shared Household */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Shared Household
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.shared / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {formatAmount(spenderSummary.shared)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Joint family expenses</p>
          </div>
        </div>

        {/* Budget & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetCard
            totalSpent={spenderSummary.total}
            budgetLimit={currentBudget}
            onUpdateBudget={handleUpdateBudget}
          />
          <CategoryBreakdownChart categories={categorySummary} />
        </div>

        {/* Expense Ledger Table Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Table Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses by title or note..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Spender Filter */}
              <select
                value={filterSpender}
                onChange={(e) => setFilterSpender(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
              >
                <option value="all">All Spenders</option>
                <option value="Masum">Masum</option>
                <option value="Toyeeba">Toyeeba</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Spender</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching expense entries found for this month.
                    </td>
                  </tr>
                ) : (
                  displayedEntries.map((entry) => {
                    const cat = catMap.get(entry.category) || {
                      label: entry.category,
                      color: '#64748b',
                    };

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {entry.date}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{entry.title}</p>
                          {entry.note && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{entry.note}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.label.split('(')[0].trim()}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                              entry.spentBy === 'Masum'
                                ? 'bg-teal-50 text-teal-700'
                                : entry.spentBy === 'Toyeeba'
                                ? 'bg-pink-50 text-pink-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {entry.spentBy}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {entry.paymentMethod}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatAmount(entry.amount)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExpense(entry);
                                setIsExpenseModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(entry.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Expense Modal (Add / Edit) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        categories={categories}
        currentMonthId={currentMonthId}
      />

      {/* Category Customizer Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}

