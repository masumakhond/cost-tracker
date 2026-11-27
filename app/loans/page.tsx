'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HandCoins,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  LogOut,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Wallet,
  Receipt,
  PieChart,
  SlidersHorizontal,
  ArrowLeftRight,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LoanEntry, LoanPayment, LoanType, LoanStatus } from '@/lib/types';
import { formatAmount, buildLoanSummary } from '@/lib/utils';
import { downloadLoanStatementPdf } from '@/lib/pdf';
import { LoanCard } from '@/components/LoanCard';
import { LoanModal } from '@/components/LoanModal';
import { RecordPaymentModal } from '@/components/RecordPaymentModal';
import { LoanDetailsModal } from '@/components/LoanDetailsModal';

const STORAGE_LOANS = 'cost-loans-v1';

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

// Initial sample loans if empty
const SAMPLE_LOANS: LoanEntry[] = [
  {
    id: 'loan-sample-1',
    type: 'lent',
    personName: 'Tanvir Hossain',
    amount: 15000,
    paidAmount: 5000,
    date: '2026-11-10',
    dueDate: '2026-12-15',
    note: 'Emergency personal loan, promised by mid-December',
    paymentMethod: 'bKash',
    status: 'partial',
    payments: [
      { id: 'pay-1', date: '2026-11-20', amount: 5000, note: '1st installment via bKash' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loan-sample-2',
    type: 'borrowed',
    personName: 'Rahim Uddin (Uncle)',
    amount: 25000,
    paidAmount: 0,
    date: '2026-11-05',
    dueDate: '2026-12-30',
    note: 'For home renovation advances',
    paymentMethod: 'Bank Transfer',
    status: 'active',
    payments: [],
    createdAt: new Date().toISOString(),
  },
];

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [userName, setUserName] = useState('Admin');
  const [isLoaded, setIsLoaded] = useState(false);
  const [usingLocalFallback, setUsingLocalFallback] = useState(!isCloudEnabled);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'lent' | 'borrowed' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanEntry | null>(null);

  const [paymentLoan, setPaymentLoan] = useState<LoanEntry | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [detailsLoan, setDetailsLoan] = useState<LoanEntry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Load user profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => undefined);
  }, []);

  // Fetch Cloud Data
  const fetchCloudLoans = async () => {
    if (!isCloudEnabled || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('loan_entries')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        const formatted: LoanEntry[] = data.map((item: any) => ({
          id: String(item.id),
          type: item.type as LoanType,
          personName: String(item.person_name),
          amount: Number(item.amount) || 0,
          paidAmount: Number(item.paid_amount) || 0,
          date: String(item.date).slice(0, 10),
          dueDate: item.due_date ? String(item.due_date).slice(0, 10) : undefined,
          paymentMethod: item.payment_method ? String(item.payment_method) : undefined,
          note: item.note ? String(item.note) : undefined,
          status: item.status || 'active',
          payments: Array.isArray(item.payments) ? item.payments : [],
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setLoans(formatted);
        localStorage.setItem(STORAGE_LOANS, JSON.stringify(formatted));
        setUsingLocalFallback(false);
      }
    } catch (e) {
      console.error('Cloud loans fetch failed:', e);
    }
  };

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      // Load local storage first
      const saved = localStorage.getItem(STORAGE_LOANS);
      if (saved) {
        try {
          setLoans(JSON.parse(saved));
        } catch {
          setLoans(SAMPLE_LOANS);
          localStorage.setItem(STORAGE_LOANS, JSON.stringify(SAMPLE_LOANS));
        }
      } else {
        setLoans(SAMPLE_LOANS);
        localStorage.setItem(STORAGE_LOANS, JSON.stringify(SAMPLE_LOANS));
      }
      setIsLoaded(true);

      // Check cloud
      if (isCloudEnabled && supabase) {
        try {
          const { data, error } = await supabase
            .from('loan_entries')
            .select('*')
            .order('date', { ascending: false });

          if (!error && data) {
            const formatted: LoanEntry[] = data.map((item: any) => ({
              id: String(item.id),
              type: item.type as LoanType,
              personName: String(item.person_name),
              amount: Number(item.amount) || 0,
              paidAmount: Number(item.paid_amount) || 0,
              date: String(item.date).slice(0, 10),
              dueDate: item.due_date ? String(item.due_date).slice(0, 10) : undefined,
              paymentMethod: item.payment_method ? String(item.payment_method) : undefined,
              note: item.note ? String(item.note) : undefined,
              status: item.status || 'active',
              payments: Array.isArray(item.payments) ? item.payments : [],
              createdAt: item.created_at || new Date().toISOString(),
            }));
            setLoans(formatted);
            localStorage.setItem(STORAGE_LOANS, JSON.stringify(formatted));
            setUsingLocalFallback(false);
          }
        } catch {}
      }
    };

    initData();
  }, []);

  // Realtime subscription & focus refresh
  useEffect(() => {
    if (!isCloudEnabled || !supabase) return;

    const channel = supabase
      .channel('cost-tracker-loans-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_entries' },
        () => {
          fetchCloudLoans();
        }
      )
      .subscribe();

    const handleFocus = () => {
      fetchCloudLoans();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Persist local and cloud
  const persistLoans = (next: LoanEntry[]) => {
    setLoans(next);
    localStorage.setItem(STORAGE_LOANS, JSON.stringify(next));
  };

  // Add / Edit Loan
  const handleSaveLoan = async (
    data: Omit<LoanEntry, 'id' | 'createdAt' | 'paidAmount' | 'status' | 'payments'>
  ) => {
    if (editingLoan) {
      const updated = loans.map((l) =>
        l.id === editingLoan.id ? { ...l, ...data } : l
      );
      persistLoans(updated);

      if (isCloudEnabled && supabase) {
        await supabase
          .from('loan_entries')
          .update({
            type: data.type,
            person_name: data.personName,
            amount: data.amount,
            date: data.date,
            due_date: data.dueDate || '',
            payment_method: data.paymentMethod || 'Cash',
            note: data.note || '',
          })
          .eq('id', editingLoan.id);
      }
      setEditingLoan(null);
    } else {
      const newLoan: LoanEntry = {
        ...data,
        id: `loan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        paidAmount: 0,
        status: 'active',
        payments: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [newLoan, ...loans];
      persistLoans(updated);

      if (isCloudEnabled && supabase) {
        await supabase.from('loan_entries').insert({
          id: newLoan.id,
          type: newLoan.type,
          person_name: newLoan.personName,
          amount: newLoan.amount,
          paid_amount: 0,
          date: newLoan.date,
          due_date: newLoan.dueDate || '',
          payment_method: newLoan.paymentMethod || 'Cash',
          note: newLoan.note || '',
          status: 'active',
          payments: [],
        });
      }
    }
  };

  // Record Repayment
  const handleSavePayment = async (
    loanId: string,
    payment: Omit<LoanPayment, 'id'>,
    isFullSettlement: boolean
  ) => {
    const newPayment: LoanPayment = {
      ...payment,
      id: `pay-${Date.now()}`,
    };

    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const newPaidAmount = (targetLoan.paidAmount || 0) + payment.amount;
    const newStatus: LoanStatus =
      isFullSettlement || newPaidAmount >= targetLoan.amount ? 'settled' : 'partial';
    const newPayments = [...(targetLoan.payments || []), newPayment];

    const updated = loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            paidAmount: newPaidAmount,
            status: newStatus,
            payments: newPayments,
          }
        : l
    );
    persistLoans(updated);

    if (isCloudEnabled && supabase) {
      await supabase
        .from('loan_entries')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          payments: newPayments,
        })
        .eq('id', loanId);
    }
  };

  // Delete Loan
  const handleDeleteLoan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan record?')) return;
    const updated = loans.filter((l) => l.id !== id);
    persistLoans(updated);

    if (isCloudEnabled && supabase) {
      await supabase.from('loan_entries').delete().eq('id', id);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Calculations & Filtering
  const loanSummary = useMemo(() => buildLoanSummary(loans), [loans]);

  const displayedLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Type filter
      if (typeFilter === 'lent' && loan.type !== 'lent') return false;
      if (typeFilter === 'borrowed' && loan.type !== 'borrowed') return false;
      if (typeFilter === 'settled' && loan.status !== 'settled') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = loan.personName.toLowerCase().includes(q);
        const matchNote = (loan.note || '').toLowerCase().includes(q);
        return matchName || matchNote;
      }

      return true;
    });
  }, [loans, typeFilter, searchQuery]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Loading Loan Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 sm:pb-16">
      {/* Top Mobile-Friendly Navbar with Route Switcher */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
              <HandCoins size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Loan Tracker
                </h1>
                {isCloudEnabled && !usingLocalFallback ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                    Local
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                Lenders & Borrowers • Masum & Toyeeba
              </p>
            </div>
          </div>

          {/* Navigation Route Switcher & User Profile */}
          <div className="flex items-center gap-2">
            {/* Desktop / Tablet Mode Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <Receipt size={13} />
                <span className="hidden xs:inline">Expenses</span>
              </Link>
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-teal-800 shadow-xs">
                <HandCoins size={13} />
                <span>Loans</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {userName.charAt(0)}
              </span>
              <span>{userName}</span>
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
        {/* KPI Summary Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Total Lent (To Receive from Borrowers / পাওনা) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                To Receive (Lent)
              </span>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <p className="mt-2 text-lg sm:text-2xl font-black text-emerald-700 tracking-tight">
              {formatAmount(loanSummary.totalLentRemaining)}
            </p>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
              Total Lent: {formatAmount(loanSummary.totalLent)}
            </p>
          </div>

          {/* Card 2: Total Borrowed (To Pay to Lenders / দেনা) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                To Pay (Borrowed)
              </span>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ArrowDownLeft size={16} />
              </div>
            </div>
            <p className="mt-2 text-lg sm:text-2xl font-black text-rose-700 tracking-tight">
              {formatAmount(loanSummary.totalBorrowedRemaining)}
            </p>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
              Total Borrowed: {formatAmount(loanSummary.totalBorrowed)}
            </p>
          </div>

          {/* Card 3: Net Asset / Debt Position */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Position
              </span>
              <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl ${
                loanSummary.netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <ArrowLeftRight size={16} />
              </div>
            </div>
            <p className={`mt-2 text-lg sm:text-2xl font-black tracking-tight ${
              loanSummary.netBalance >= 0 ? 'text-teal-700' : 'text-amber-700'
            }`}>
              {loanSummary.netBalance >= 0 ? '+' : ''}{formatAmount(loanSummary.netBalance)}
            </p>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
              {loanSummary.netBalance >= 0 ? 'Net Surplus (পাওনা বেশি)' : 'Net Debt (দেনা বেশি)'}
            </p>
          </div>

          {/* Card 4: Active vs Settled Loans Count */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Loan Records
              </span>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="mt-2 text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {loanSummary.activeCount} <span className="text-xs font-bold text-slate-400">Active</span>
            </p>
            <p className="text-[10px] sm:text-[11px] font-medium text-emerald-600 mt-0.5">
              {loanSummary.settledCount} Fully Settled
            </p>
          </div>
        </div>

        {/* Filter Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                typeFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Loans ({loans.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('lent')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                typeFilter === 'lent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Borrowers (I Lent)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('borrowed')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                typeFilter === 'borrowed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lenders (I Borrowed)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('settled')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                typeFilter === 'settled'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Settled
            </button>
          </div>

          {/* Action Buttons: Add Loan & Download Statement */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingLoan(null);
                setIsAddEditModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 active:scale-98"
            >
              <Plus size={16} />
              <span>Record Loan</span>
            </button>

            <button
              type="button"
              onClick={() => downloadLoanStatementPdf(loans)}
              disabled={loans.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-98 disabled:opacity-50"
              title="Download Loan Statement PDF"
            >
              <Download size={14} className="text-teal-600" />
              <span className="hidden sm:inline">PDF Statement</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Lender / Borrower name or note..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition shadow-xs"
          />
        </div>

        {/* Loan Cards List View */}
        {displayedLoans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-3">
              <HandCoins size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No loan records found</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              {searchQuery || typeFilter !== 'all'
                ? 'Try clearing the search or filter tab.'
                : 'Keep clear track of money you lent to borrowers and money you borrowed from lenders.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingLoan(null);
                setIsAddEditModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition"
            >
              <Plus size={16} /> Record First Loan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {displayedLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onOpenDetails={(l) => {
                  setDetailsLoan(l);
                  setIsDetailsModalOpen(true);
                }}
                onOpenPayment={(l) => {
                  setPaymentLoan(l);
                  setIsPaymentModalOpen(true);
                }}
                onEdit={(l) => {
                  setEditingLoan(l);
                  setIsAddEditModalOpen(true);
                }}
                onDelete={handleDeleteLoan}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (+) for 1-thumb Add on Mobile */}
      <button
        type="button"
        onClick={() => {
          setEditingLoan(null);
          setIsAddEditModalOpen(true);
        }}
        className="sm:hidden fixed bottom-18 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/40 active:scale-90 transition"
        title="Record Loan"
      >
        <Plus size={24} />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 pb-[env(safe-area-inset-bottom,10px)] pt-2 backdrop-blur-lg shadow-lg">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 text-slate-500 hover:text-slate-700 active:scale-90 transition"
          >
            <Receipt size={20} />
            <span className="mt-1 text-[10px] tracking-tight">Expenses</span>
          </Link>

          <div className="flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 text-teal-700 font-bold relative active:scale-90 transition">
            <HandCoins size={20} strokeWidth={2.5} className="scale-110" />
            <span className="mt-1 text-[10px] tracking-tight">Loans</span>
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
          </div>
        </div>
      </nav>

      {/* Add / Edit Modal */}
      <LoanModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingLoan(null);
        }}
        onSave={handleSaveLoan}
        initialData={editingLoan}
      />

      {/* Record Repayment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentLoan(null);
        }}
        loan={paymentLoan}
        onSavePayment={handleSavePayment}
      />

      {/* Loan Details Modal */}
      <LoanDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsLoan(null);
        }}
        loan={detailsLoan}
        onOpenPaymentModal={(l) => {
          setPaymentLoan(l);
          setIsPaymentModalOpen(true);
        }}
        onEdit={(l) => {
          setEditingLoan(l);
          setIsAddEditModalOpen(true);
        }}
        onDelete={handleDeleteLoan}
      />
    </div>
  );
}
