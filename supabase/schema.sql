-- ==============================================================================
-- Cost Tracker — PostgreSQL Schema & RLS Policies for Supabase
-- Run this in your Supabase project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create table for Expense Entries
create table if not exists public.expense_entries (
  id text primary key,
  month_id text not null,
  date text not null,
  title text not null,
  amount numeric(12, 2) not null default 0,
  category text not null default 'other',
  spent_by text not null default 'Masum',
  payment_method text not null default 'Cash',
  note text default '',
  is_recurring boolean default false,
  created_at timestamptz default now() not null
);

create index if not exists idx_expenses_month on public.expense_entries(month_id, date desc);
create index if not exists idx_expenses_category on public.expense_entries(category);
create index if not exists idx_expenses_spent_by on public.expense_entries(spent_by);

-- 2. Create table for Monthly Budgets
create table if not exists public.monthly_budgets (
  month_id text primary key,
  limit_amount numeric(12, 2) not null default 50000,
  created_at timestamptz default now() not null
);

-- 3. Create table for Custom Categories
create table if not exists public.expense_categories (
  id text primary key,
  label text not null,
  color text not null,
  icon text default 'Tag',
  is_custom boolean default true,
  created_at timestamptz default now() not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.expense_entries enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.expense_categories enable row level security;

-- Policies (App authentication is handled by Next.js session cookies & JWT)
create policy "Allow all operations on expense_entries"
  on public.expense_entries for all
  using (true)
  with check (true);

create policy "Allow all operations on monthly_budgets"
  on public.monthly_budgets for all
  using (true)
  with check (true);

create policy "Allow all operations on expense_categories"
  on public.expense_categories for all
  using (true)
  with check (true);

-- 5. Create table for Loan / Debt Entries
create table if not exists public.loan_entries (
  id text primary key,
  type text not null default 'lent', -- 'lent' (Money given to Borrower) | 'borrowed' (Money taken from Lender)
  person_name text not null,
  amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  date text not null,
  due_date text default '',
  payment_method text default 'Cash',
  note text default '',
  status text not null default 'active', -- 'active', 'partial', 'settled'
  payments jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists idx_loans_type on public.loan_entries(type);
create index if not exists idx_loans_status on public.loan_entries(status);

alter table public.loan_entries enable row level security;

create policy "Allow all operations on loan_entries"
  on public.loan_entries for all
  using (true)
  with check (true);


