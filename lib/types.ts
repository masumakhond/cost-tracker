export type SpenderType = 'Masum' | 'Toyeeba' | 'Shared';

export type PaymentMethodType =
  | 'Cash'
  | 'bKash'
  | 'Nagad'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Other';

export interface ExpenseCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface ExpenseEntry {
  id: string;
  monthId: string; // YYYY-MM
  date: string;    // YYYY-MM-DD
  title: string;
  amount: number;
  category: string;
  spentBy: SpenderType;
  paymentMethod: PaymentMethodType;
  note: string;
  isRecurring?: boolean;
}

export interface MonthlyBudget {
  monthId: string;
  limitAmount: number;
}

export interface SpenderSummary {
  masum: number;
  toyeeba: number;
  shared: number;
  total: number;
}

export interface CategorySummary {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percentage: number;
}

