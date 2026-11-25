import { ExpenseCategory, ExpenseEntry, PaymentMethodType } from './types';

export const COOKIE_NAME = 'cost_tracker_session';

export const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'groceries', label: 'বাজার ও মুদি (Groceries)', color: '#10b981', icon: 'ShoppingCart' },
  { id: 'rent', label: 'বাসা ভাড়া (House Rent)', color: '#6366f1', icon: 'Home' },
  { id: 'utilities', label: 'ইউটিলিটি ও বিল (Bills)', color: '#f59e0b', icon: 'Zap' },
  { id: 'medical', label: 'স্বাস্থ্য ও ওষুধ (Healthcare)', color: '#ef4444', icon: 'HeartPulse' },
  { id: 'transport', label: 'যাতায়াত (Transport)', color: '#06b6d4', icon: 'Car' },
  { id: 'dining', label: 'খাবার ও রেস্টুরেন্ট (Dining)', color: '#f97316', icon: 'Utensils' },
  { id: 'shopping', label: 'কেনাকাটা (Shopping)', color: '#ec4899', icon: 'ShoppingBag' },
  { id: 'education', label: 'শিক্ষা ও বাচ্চা (Child/Edu)', color: '#8b5cf6', icon: 'GraduationCap' },
  { id: 'debt', label: 'ঋণ ও ইএমআই (Loan/EMI)', color: '#dc2626', icon: 'CreditCard' },
  { id: 'entertainment', label: 'বিনোদন ও ভ্রমণ (Outing)', color: '#14b8a6', icon: 'Plane' },
  { id: 'charity', label: 'দান ও সদকা (Charity)', color: '#84cc16', icon: 'Gift' },
  { id: 'other', label: 'বিবিধ (Miscellaneous)', color: '#64748b', icon: 'Package' },
];

export const PAYMENT_METHODS: PaymentMethodType[] = [
  'Cash',
  'bKash',
  'Nagad',
  'Bank Transfer',
  'Credit Card',
  'Other',
];

export const PREFILLED_EXPENSES: Omit<ExpenseEntry, 'id'>[] = [
  // 2026-11 (Current month)
  { monthId: '2026-11', date: '2026-11-01', title: 'Apartment Rent', amount: 22000, category: 'rent', spentBy: 'Masum', paymentMethod: 'Bank Transfer', note: 'Monthly flat rent' },
  { monthId: '2026-11', date: '2026-11-02', title: 'Monthly Grocery Shopping', amount: 8500, category: 'groceries', spentBy: 'Shared', paymentMethod: 'Cash', note: 'Rice, oil, spices, cleaning supplies' },
  { monthId: '2026-11', date: '2026-11-04', title: 'Electricity & Gas Bill', amount: 2800, category: 'utilities', spentBy: 'Masum', paymentMethod: 'bKash', note: 'DESCO & Titas' },
  { monthId: '2026-11', date: '2026-11-06', title: 'High-speed Internet Bill', amount: 1200, category: 'utilities', spentBy: 'Masum', paymentMethod: 'bKash', note: 'Dot Internet 40mbps' },
  { monthId: '2026-11', date: '2026-11-08', title: 'Weekly Fish & Meat Bazaar', amount: 4200, category: 'groceries', spentBy: 'Masum', paymentMethod: 'Cash', note: 'Beef, Hilsha fish, chicken' },
  { monthId: '2026-11', date: '2026-11-10', title: 'Family Weekend Dinner', amount: 2400, category: 'dining', spentBy: 'Toyeeba', paymentMethod: 'Credit Card', note: 'Kacchi Biryani & dessert' },
  { monthId: '2026-11', date: '2026-11-12', title: 'Baby Diapers & Lactogen', amount: 3600, category: 'education', spentBy: 'Toyeeba', paymentMethod: 'Cash', note: '2 packs diapers, baby formula' },
  { monthId: '2026-11', date: '2026-11-15', title: 'Father Medicine & Checkup', amount: 3200, category: 'medical', spentBy: 'Masum', paymentMethod: 'bKash', note: 'Diabetes & blood pressure' },
  { monthId: '2026-11', date: '2026-11-18', title: 'Uber & Fuel Expenses', amount: 1800, category: 'transport', spentBy: 'Masum', paymentMethod: 'Nagad', note: 'Office commutes' },
  { monthId: '2026-11', date: '2026-11-20', title: 'Winter Clothing Shopping', amount: 5500, category: 'shopping', spentBy: 'Toyeeba', paymentMethod: 'Credit Card', note: 'Warm jackets & shawls' },
  { monthId: '2026-11', date: '2026-11-22', title: 'Charity & Donation', amount: 1500, category: 'charity', spentBy: 'Shared', paymentMethod: 'Cash', note: 'Local madrasa' },

  // 2026-10 (Previous month)
  { monthId: '2026-10', date: '2026-10-01', title: 'Apartment Rent', amount: 22000, category: 'rent', spentBy: 'Masum', paymentMethod: 'Bank Transfer', note: 'Monthly flat rent' },
  { monthId: '2026-10', date: '2026-10-03', title: 'Monthly Grocery Shopping', amount: 9200, category: 'groceries', spentBy: 'Shared', paymentMethod: 'Cash', note: 'Bazaar' },
  { monthId: '2026-10', date: '2026-10-05', title: 'Utility Bills (DESCO/Gas)', amount: 3100, category: 'utilities', spentBy: 'Masum', paymentMethod: 'bKash', note: 'Paid on time' },
  { monthId: '2026-10', date: '2026-10-08', title: 'Doctor Consultation & Lab Tests', amount: 4800, category: 'medical', spentBy: 'Toyeeba', paymentMethod: 'Credit Card', note: 'Annual health checkup' },
  { monthId: '2026-10', date: '2026-10-14', title: 'Home Repairs & Plumber', amount: 1500, category: 'other', spentBy: 'Masum', paymentMethod: 'Cash', note: 'Kitchen sink repair' },
  { monthId: '2026-10', date: '2026-10-22', title: 'Baby Toys & Essentials', amount: 2600, category: 'education', spentBy: 'Toyeeba', paymentMethod: 'bKash', note: 'Educational blocks' },
];

