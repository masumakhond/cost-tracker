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
  englishLabel?: string;
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

export type LoanType = 'lent' | 'borrowed';
export type LoanStatus = 'active' | 'partial' | 'settled';

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface LoanEntry {
  id: string;
  type: LoanType; // 'lent' (Money given to Borrower) | 'borrowed' (Money taken from Lender)
  personName: string; // Borrower's Name (if lent) or Lender's Name (if borrowed)
  amount: number; // Principal Amount
  paidAmount: number; // Total amount returned / paid so far
  date: string; // YYYY-MM-DD
  dueDate?: string; // Target repayment date (optional)
  note?: string;
  paymentMethod?: string;
  status: LoanStatus;
  payments?: LoanPayment[];
  createdAt: string;
}

export interface LoanSummary {
  totalLent: number;
  totalLentRemaining: number;
  totalBorrowed: number;
  totalBorrowedRemaining: number;
  netBalance: number;
  activeCount: number;
  settledCount: number;
}
