'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Login failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setLoading(false);
      setError('Connection error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-300/40 backdrop-blur-md">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 px-7 py-9 text-white">
          <div className="flex items-center gap-3.5">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-md">
              <CreditCard size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                Family Finance Ledger
              </p>
              <h1 className="text-2xl font-black tracking-tight">Cost Tracker</h1>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-300">
            Track expenses, manage budgets, and analyze spending together.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-4 p-7">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Username
            </span>
            <div className="relative mt-1.5">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                placeholder="masumbillahakhond"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </span>
            <div className="relative mt-1.5">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Access Hint */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <ShieldCheck size={14} className="text-teal-600" /> Authorized Admin Accounts:
            </div>
            <div className="mt-1 space-y-0.5">
              <div>• <strong>masumbillahakhond</strong> (Masum)</div>
              <div>• <strong>toyeeba</strong> (Toyeeba)</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

