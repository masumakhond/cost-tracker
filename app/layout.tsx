import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cost Tracker — Family Expense Ledger & Budgeting',
  description: 'Modern, customizable dynamic cost and expense tracker for Masum & Toyeeba with budget tracking and PDF reports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

