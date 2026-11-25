import { ExpenseCategory, ExpenseEntry, SpenderSummary, CategorySummary } from './types';
import { MONTHS, DEFAULT_CATEGORIES } from './constants';

export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `৳${Math.round(num).toLocaleString('en-IN')}`;
}

export function getCurrentYearMonth() {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  };
}

export function getLastMonthYearMonth() {
  const now = new Date();
  now.setDate(1);
  now.setMonth(now.getMonth() - 1);
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  };
}

export function monthLabel(monthId: string): string {
  const parts = monthId.split('-');
  const month = parts[1] || '01';
  const year = parts[0] || '';
  const label = MONTHS.find((item) => item.value === month)?.label ?? month;
  return `${label} ${year}`;
}

export function buildSpenderSummary(entries: ExpenseEntry[]): SpenderSummary {
  let masum = 0;
  let toyeeba = 0;
  let shared = 0;

  entries.forEach((e) => {
    const amt = Number(e.amount) || 0;
    if (e.spentBy === 'Masum') masum += amt;
    else if (e.spentBy === 'Toyeeba') toyeeba += amt;
    else if (e.spentBy === 'Shared') shared += amt;
  });

  return {
    masum,
    toyeeba,
    shared,
    total: masum + toyeeba + shared,
  };
}

export function buildCategorySummary(
  entries: ExpenseEntry[],
  categories: ExpenseCategory[] = DEFAULT_CATEGORIES
): CategorySummary[] {
  const total = entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const catMap: Record<string, { amount: number; count: number }> = {};

  entries.forEach((e) => {
    const catId = e.category || 'other';
    if (!catMap[catId]) {
      catMap[catId] = { amount: 0, count: 0 };
    }
    catMap[catId].amount += Number(e.amount) || 0;
    catMap[catId].count += 1;
  });

  return categories
    .map((cat) => {
      const data = catMap[cat.id] || { amount: 0, count: 0 };
      return {
        category: cat,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

