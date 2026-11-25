'use client';

import React from 'react';
import { Receipt, PieChart, Target, SlidersHorizontal, Download } from 'lucide-react';

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
  const tabs = [
    {
      id: 'expenses' as MobileTab,
      label: 'Expenses',
      icon: Receipt,
      badge: expenseCount > 0 ? expenseCount : null,
    },
    {
      id: 'analytics' as MobileTab,
      label: 'Analytics',
      icon: PieChart,
      badge: null,
    },
    {
      id: 'budget' as MobileTab,
      label: 'Budget',
      icon: Target,
      badge: null,
    },
    {
      id: 'categories' as MobileTab,
      label: 'Categories',
      icon: SlidersHorizontal,
      badge: null,
    },
    {
      id: 'pdf' as MobileTab,
      label: 'Statements',
      icon: Download,
      badge: null,
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 pb-[env(safe-area-inset-bottom,10px)] pt-2 backdrop-blur-lg shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-2xl py-1 transition-all active:scale-90 ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                {tab.badge !== null && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[9px] font-extrabold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="mt-1 text-[10px] tracking-tight leading-none">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
