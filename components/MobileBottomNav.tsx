'use client';

import React from 'react';
import Link from 'next/link';
import { Receipt, HandCoins, PieChart, Target, Download } from 'lucide-react';

export type MobileTab = 'expenses' | 'analytics' | 'budget' | 'categories' | 'pdf';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  expenseCount: number;
}

export function MobileBottomNav({
  activeTab,
  onChangeTab,
  expenseCount,
}: MobileBottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 pb-[env(safe-area-inset-bottom,10px)] pt-2 backdrop-blur-lg shadow-lg">
      <div className="flex items-center justify-around">
        {/* Expenses Tab */}
        <button
          onClick={() => onChangeTab('expenses')}
          className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 ${
            activeTab === 'expenses'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Receipt
              size={20}
              strokeWidth={activeTab === 'expenses' ? 2.5 : 1.8}
              className={`transition-transform duration-200 ${activeTab === 'expenses' ? 'scale-110' : ''}`}
            />
            {expenseCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[9px] font-extrabold text-white shadow-xs">
                {expenseCount}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight leading-none">Expenses</span>
          {activeTab === 'expenses' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
          )}
        </button>

        {/* Loans Sub-page Link */}
        <Link
          href="/loans"
          className="relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 text-slate-500 font-medium hover:text-teal-700"
        >
          <div className="relative">
            <HandCoins size={20} strokeWidth={1.8} />
          </div>
          <span className="mt-1 text-[10px] tracking-tight leading-none">Loans</span>
        </Link>

        {/* Analytics Tab */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 ${
            activeTab === 'analytics'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <PieChart
              size={20}
              strokeWidth={activeTab === 'analytics' ? 2.5 : 1.8}
              className={`transition-transform duration-200 ${activeTab === 'analytics' ? 'scale-110' : ''}`}
            />
          </div>
          <span className="mt-1 text-[10px] tracking-tight leading-none">Analytics</span>
          {activeTab === 'analytics' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
          )}
        </button>

        {/* Budget Tab */}
        <button
          onClick={() => onChangeTab('budget')}
          className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 ${
            activeTab === 'budget'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Target
              size={20}
              strokeWidth={activeTab === 'budget' ? 2.5 : 1.8}
              className={`transition-transform duration-200 ${activeTab === 'budget' ? 'scale-110' : ''}`}
            />
          </div>
          <span className="mt-1 text-[10px] tracking-tight leading-none">Budget</span>
          {activeTab === 'budget' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
          )}
        </button>

        {/* Statements Tab */}
        <button
          onClick={() => onChangeTab('pdf')}
          className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 ${
            activeTab === 'pdf'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Download
              size={20}
              strokeWidth={activeTab === 'pdf' ? 2.5 : 1.8}
              className={`transition-transform duration-200 ${activeTab === 'pdf' ? 'scale-110' : ''}`}
            />
          </div>
          <span className="mt-1 text-[10px] tracking-tight leading-none">Reports</span>
          {activeTab === 'pdf' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
          )}
        </button>
      </div>
    </nav>
  );
}
