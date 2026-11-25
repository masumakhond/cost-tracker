# 💸 Cost Tracker — Modern, Customizable Family Expense Ledger

A lightweight, modern, dynamic expense and cost tracking web app designed for couples and families (Masum & Toyeeba). Track monthly expenses, manage budgets, analyze category breakdowns with visual charts, and download polished monthly/yearly PDF statements.

---

## ✨ Key Features

1. **Dual Storage Mode (Zero Configuration Required)**:
   - **Local Storage Fallback**: Works immediately out-of-the-box with prefilled realistic historical data.
   - **Supabase Cloud Sync**: Plug in your Supabase credentials to sync data across devices.
2. **Dynamic Customization**:
   - Customizable Expense Categories: Add, customize colors, and manage categories anytime.
   - 12 Built-in Categories: Groceries, House Rent, Utilities & Bills, Healthcare & Medicine, Transport, Dining Out, Shopping, Childcare & Education, Loan/EMI, Outing & Travel, Charity & Zakat, Miscellaneous.
3. **Budget Target & Tracking**:
   - Set monthly spending limits (e.g. ৳50,000).
   - Real-time progress bar with automatic status alerts (normal, warning at 75%, alert when over-budget).
4. **Visual Analytics**:
   - Recharts Donut & Progress Breakdown showing exact percentage and ৳ share for each category.
   - Spender-wise breakdown (Masum's expenses, Toyeeba's expenses, and Shared household expenses).
5. **Interactive Expense Ledger**:
   - Search by title or notes.
   - Filter by Category and Spender (All / Masum / Toyeeba / Shared).
   - Quick Add / Edit / Delete with modal interface.
6. **PDF & Data Statements**:
   - **Download Month PDF**: Clean formatted PDF statement with category breakdown and itemized transaction tables.
   - **Download Year PDF**: Annual ledger report with month-by-month trends.
7. **Secure Authentication**:
   - JWT-signed session cookie authentication with protected routes.
   - Default accounts:
     - `masumbillahakhond` (Masum) — password `Ma$um@1995`
     - `toyeeba` (Toyeeba) — password `toyeeb@99`

---

## 🚀 Quick Start

### 1. Run Locally

```bash
cd myProjects/cost-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Log in with:
- Username: `masumbillahakhond`
- Password: `Ma$um@1995`

---

### 2. Connect Supabase Cloud Sync (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. In `myProjects/cost-tracker/.env.local`, set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
4. Restart your development server (`npm run dev`).

---

### 3. Deploy to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for Cost Tracker"
   git remote add origin https://github.com/masumakhond/cost-tracker.git
   git push -u origin main
   ```
2. Import the repository into [Vercel](https://vercel.com).
3. Set environment variable `JWT_SECRET` in Vercel project settings.
4. Deploy!

