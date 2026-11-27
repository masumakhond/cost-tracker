'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Download,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Database,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  HandCoins,
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
import { MobileExpenseCard } from '@/components/MobileExpenseCard';
import { MobileBottomNav, MobileTab } from '@/components/MobileBottomNav';

// Storage keys
const STORAGE_ENTRIES = 'cost-entries-v1';
const STORAGE_BUDGETS = 'cost-budgets-v1';
const STORAGE_CATEGORIES = 'cost-categories-v1';

// Supabase configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qwiecsnziofuigkrxjku.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_UR3C04Tfub9_awDWH5vJWw_V4cdS9Cv';

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

  // Mobile navigation & view states
  const [mobileTab, setMobileTab] = useState<MobileTab>('expenses');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSpender, setFilterSpender] = useState<string>('all');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const currentMonthId = `${selectedYear}-${selectedMonth}`;

  // Automatically adapt view mode on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => undefined);
  }, []);

  // Core Cloud Fetcher
  const fetchCloudData = async () => {
    if (!isCloudEnabled || !supabase) return;
    try {
      // 1. Fetch Expenses
      const { data, error } = await supabase
        .from('expense_entries')
        .select('*')
        .order('date', { ascending: false });

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
        setUsingLocalFallback(false);
      }

      // 2. Fetch Budgets
      const { data: budgetData } = await supabase.from('monthly_budgets').select('*');
      if (budgetData && budgetData.length > 0) {
        const budgetMap: Record<string, number> = {};
        budgetData.forEach((b: any) => {
          budgetMap[b.month_id] = Number(b.limit_amount);
        });
        setBudgets((prev) => ({ ...prev, ...budgetMap }));
        localStorage.setItem(STORAGE_BUDGETS, JSON.stringify(budgetMap));
      }

      // 3. Fetch Categories
      const { data: catData } = await supabase.from('expense_categories').select('*');
      if (catData && catData.length > 0) {
        const formattedCats: ExpenseCategory[] = catData.map((c: any) => ({
          id: c.id,
          label: c.label,
          color: c.color,
          icon: c.icon || 'Tag',
          isCustom: Boolean(c.is_custom),
        }));
        setCategories(formattedCats);
        localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(formattedCats));
      }
    } catch (err) {
      console.error('Cloud fetch failed, using local storage', err);
    }
  };

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      // Load Categories from local first
      const savedCats = localStorage.getItem(STORAGE_CATEGORIES);
      if (savedCats) {
        try {
          setCategories(JSON.parse(savedCats));
        } catch {}
      }

      // Load Budgets from local first
      const savedBudgets = localStorage.getItem(STORAGE_BUDGETS);
      if (savedBudgets) {
        try {
          setBudgets(JSON.parse(savedBudgets));
        } catch {}
      }

      // Check cloud or local storage
      if (isCloudEnabled && supabase) {
        try {
          const { data, error } = await supabase
            .from('expense_entries')
            .select('*')
            .order('date', { ascending: false });

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
            setUsingLocalFallback(false);
            setIsLoaded(true);

            // Fetch other cloud records
            fetchCloudData();
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

  // Set up Supabase Realtime channel for instant cross-device sync
  useEffect(() => {
    if (!isCloudEnabled || !supabase) return;

    const channel = supabase
      .channel('cost-tracker-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_entries' },
        () => {
          fetchCloudData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_budgets' },
        () => {
          fetchCloudData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_categories' },
        () => {
          fetchCloudData();
        }
      )
      .subscribe();

    const handleFocus = () => {
      fetchCloudData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
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
    return entries.filter(
      (e) => e.monthId === currentMonthId || (e.date || '').startsWith(currentMonthId)
    );
  }, [entries, currentMonthId]);

  // Filtered entries for table/cards (sorted by date descending)
  const displayedEntries = useMemo(() => {
    return monthEntries
      .filter((e) => {
        const matchSearch =
          !searchQuery.trim() ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.note.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = filterCategory === 'all' || e.category === filterCategory;
        const matchSpender = filterSpender === 'all' || e.spentBy === filterSpender;
        return matchSearch && matchCat && matchSpender;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [monthEntries, searchQuery, filterCategory, filterSpender]);

  // Helper to format date header
  const formatDateLabel = (dateStr: string): string => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;

      const dateObj = new Date(y, m - 1, d);
      const today = new Date();
      const isToday =
        today.getFullYear() === y &&
        today.getMonth() === m - 1 &&
        today.getDate() === d;

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        yesterday.getFullYear() === y &&
        yesterday.getMonth() === m - 1 &&
        yesterday.getDate() === d;

      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

      if (isToday) {
        return `Today • ${d} ${monthName}`;
      }
      if (isYesterday) {
        return `Yesterday • ${d} ${monthName}`;
      }
      return `${d} ${monthName} ${y} • ${dayName}`;
    } catch {
      return dateStr;
    }
  };

  // Group displayed entries by Date for same-date rows
  const groupedEntriesByDate = useMemo(() => {
    const groups: Record<string, ExpenseEntry[]> = {};
    for (const entry of displayedEntries) {
      const d = entry.date || 'Unknown Date';
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(entry);
    }

    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
        entries: items,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [displayedEntries]);

  // Calculations
  const spenderSummary = useMemo(() => buildSpenderSummary(monthEntries), [monthEntries]);
  const categorySummary = useMemo(
    () => buildCategorySummary(monthEntries, categories),
    [monthEntries, categories]
  );
  const currentBudget = budgets[currentMonthId] || 50000;

  // Add / Edit Entry
  const handleSaveExpense = async (data: Omit<ExpenseEntry, 'id'>) => {
    if (editingExpense) {
      const updated = entries.map((e) =>
        e.id === editingExpense.id ? { ...data, id: editingExpense.id } : e
      );
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
  const handleUpdateBudget = async (newLimit: number) => {
    const updated = { ...budgets, [currentMonthId]: newLimit };
    setBudgets(updated);
    localStorage.setItem(STORAGE_BUDGETS, JSON.stringify(updated));

    if (isCloudEnabled && supabase) {
      await supabase.from('monthly_budgets').upsert({
        month_id: currentMonthId,
        limit_amount: newLimit,
      });
    }
  };

  // Category Management
  const handleAddCategory = async (newCat: ExpenseCategory) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));

    if (isCloudEnabled && supabase) {
      await supabase.from('expense_categories').upsert({
        id: newCat.id,
        label: newCat.label,
        color: newCat.color,
        icon: newCat.icon,
        is_custom: newCat.isCustom,
      });
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));

    if (isCloudEnabled && supabase) {
      await supabase.from('expense_categories').delete().eq('id', catId);
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 sm:pb-16">
      {/* Top Mobile-Friendly Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Cost Tracker
                </h1>
                {isCloudEnabled && !usingLocalFallback ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                    Local Only
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                Masum & Toyeeba • {monthLabel(currentMonthId)}
              </p>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher: Expenses vs Loans */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-teal-800 shadow-xs">
                <Receipt size={13} />
                <span className="hidden xs:inline">Expenses</span>
              </span>
              <Link
                href="/loans"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <HandCoins size={13} />
                <span>Loans</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Customize categories"
            >
              <SlidersHorizontal size={14} className="text-teal-600" />
              <span>Categories</span>
            </button>

            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {userName.charAt(0)}
              </span>
              <span className="hidden xs:inline">{userName}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-1.5 sm:p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-90"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Month Selector Bar & Desktop Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs">
          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition"
              title="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition"
              title="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Desktop Actions Row */}
          <div className="hidden sm:flex items-center gap-2">
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

        {/* Sync Mode Banner */}
        {usingLocalFallback && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-amber-600 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong>Local Storage Active:</strong> All changes save instantly on this phone.
              </span>
            </div>
            <span className="rounded-md bg-amber-200 px-2 py-0.5 font-bold text-amber-800 text-[10px]">
              Offline
            </span>
          </div>
        )}

        {/* 2x2 Metric Cards Grid for Mobile & Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Total Spent */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Expenses
              </span>
              <div className="rounded-xl bg-teal-50 p-1.5 sm:p-2 text-teal-600">
                <Wallet size={16} />
              </div>
            </div>
            <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              {formatAmount(spenderSummary.total)}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">
              {monthEntries.length} items logged
            </p>
          </div>

          {/* Card 2: Masum's Share */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Masum
              </span>
              <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-teal-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.masum / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              {formatAmount(spenderSummary.masum)}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">Masum paid</p>
          </div>

          {/* Card 3: Toyeeba's Share */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Toyeeba
              </span>
              <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-pink-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.toyeeba / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              {formatAmount(spenderSummary.toyeeba)}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">Toyeeba paid</p>
          </div>

          {/* Card 4: Shared Household */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Shared
              </span>
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-800">
                {spenderSummary.total > 0 ? Math.round((spenderSummary.shared / spenderSummary.total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              {formatAmount(spenderSummary.shared)}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">Joint family</p>
          </div>
        </div>

        {/* Content Body Based on Mobile Tab or Desktop View */}
        {/* On desktop (sm/md/lg), show Budget & Charts side-by-side */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-6">
          <BudgetCard
            totalSpent={spenderSummary.total}
            budgetLimit={currentBudget}
            onUpdateBudget={handleUpdateBudget}
          />
          <CategoryBreakdownChart categories={categorySummary} />
        </div>

        {/* Mobile View: Tab Content Switcher */}
        <div className="sm:hidden">
          {mobileTab === 'budget' && (
            <div className="space-y-4">
              <BudgetCard
                totalSpent={spenderSummary.total}
                budgetLimit={currentBudget}
                onUpdateBudget={handleUpdateBudget}
              />
            </div>
          )}

          {mobileTab === 'analytics' && (
            <div className="space-y-4">
              <CategoryBreakdownChart categories={categorySummary} />
            </div>
          )}

          {mobileTab === 'categories' && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <SlidersHorizontal size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Custom Categories</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add, customize, and edit expense categories according to your family needs.
              </p>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-teal-600/30 hover:bg-teal-700 active:scale-95 transition"
              >
                Open Category Manager
              </button>
            </div>
          )}

          {mobileTab === 'pdf' && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Download Statements</h3>
                <p className="text-xs text-slate-500">
                  Export high-resolution PDF statements formatted for mobile and printing.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => downloadMonthlyCostPdf(currentMonthId, monthEntries, categories)}
                  disabled={monthEntries.length === 0}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <Download size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {monthLabel(currentMonthId)} Statement
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {monthEntries.length} items • {formatAmount(spenderSummary.total)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-600">Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadAnnualCostPdf(selectedYear, entries, categories)}
                  disabled={entries.length === 0}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Full Year {selectedYear} Statement
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        All 12 months comprehensive ledger
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-600">Download</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expenses List View (Shown on Desktop always, on Mobile when on 'expenses' tab) */}
        {(mobileTab === 'expenses' || typeof window === 'undefined') && (
          <div className="space-y-3">
            {/* Search, Filter Pills & View Mode Toggle */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs space-y-3">
              {/* Top Search & Toggle Row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses by title or note..."
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>

                {/* View Mode Switcher (Card vs Table) */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      viewMode === 'cards'
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Card View (Mobile Optimized)"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      viewMode === 'table'
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Table View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                    filterCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({monthEntries.length})
                </button>
                {categories.map((c) => {
                  const count = monthEntries.filter((e) => e.category === c.id).length;
                  if (count === 0 && filterCategory !== c.id) return null;
                  const isSelected = filterCategory === c.id;
                  const name = c.englishLabel || c.label.split('(')[0].trim();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFilterCategory(c.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{name}</span>
                      <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Spender Segmented Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Spender:
                </span>
                {(['all', 'Masum', 'Toyeeba', 'Shared'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterSpender(s)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                      filterSpender === s
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s === 'all' ? 'Everyone' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses Display: Cards or Table */}
            {displayedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Receipt size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No expenses found</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  {searchQuery || filterCategory !== 'all' || filterSpender !== 'all'
                    ? 'Try clearing the search or category filter.'
                    : 'Click the + button to add the first expense for this month.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  className="mt-4 flex items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition"
                >
                  <Plus size={16} /> Add Expense
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              /* Mobile Compact Cards Grouped by Date Row */
              <div className="space-y-4">
                {groupedEntriesByDate.map((group) => (
                  <div key={group.date} className="space-y-1.5">
                    {/* Date Row Header: Date, Item Count & Daily Total */}
                    <div className="flex items-center justify-between px-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Calendar size={13} className="text-teal-600" />
                        <span>{formatDateLabel(group.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <span className="text-slate-400">
                          {group.entries.length} {group.entries.length === 1 ? 'item' : 'items'}
                        </span>
                        <span>•</span>
                        <span className="font-extrabold text-teal-800">
                          {formatAmount(group.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Expenses for this date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                      {group.entries.map((entry) => (
                        <MobileExpenseCard
                          key={entry.id}
                          entry={entry}
                          category={catMap.get(entry.category)}
                          onEdit={(it) => {
                            setEditingExpense(it);
                            setIsExpenseModalOpen(true);
                          }}
                          onDelete={handleDeleteExpense}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
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
                      {displayedEntries.map((entry) => {
                        const cat = catMap.get(entry.category) || {
                          label: entry.category,
                          englishLabel: entry.category,
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
                                <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                  {entry.note}
                                </p>
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
                                <span>{cat.englishLabel || cat.label.split('(')[0].trim()}</span>
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
                            <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
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
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (+) for instant 1-thumb add on mobile */}
      <button
        type="button"
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        className="sm:hidden fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/40 transition active:scale-90"
        title="Add Expense"
      >
        <Plus size={28} />
      </button>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={(tab) => {
          if (tab === 'categories') {
            setIsCategoryModalOpen(true);
          } else {
            setMobileTab(tab);
          }
        }}
        expenseCount={monthEntries.length}
      />

      {/* Expense Modal (Add / Edit) with Mobile Bottom Sheet Animation */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        onAddCategory={handleAddCategory}
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
