'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Smartphone } from 'lucide-react';
import { login } from '@/lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get('phone')), String(fd.get('password')));
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-brand text-white font-black text-2xl mb-4">
            B
          </span>
          <h1 className="text-2xl font-black text-white">پنل مدیریت برند ما</h1>
          <p className="text-white/50 mt-1 text-sm">برای ادامه وارد شوید</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-3xl p-7 grid gap-5">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">شماره موبایل</label>
            <div className="relative">
              <Smartphone
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                name="phone"
                required
                dir="ltr"
                placeholder="09123456789"
                className="w-full rounded-xl border border-line bg-white pr-10 pl-4 py-3 outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">رمز عبور</label>
            <div className="relative">
              <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                name="password"
                type="password"
                required
                dir="ltr"
                className="w-full rounded-xl border border-line bg-white pr-10 pl-4 py-3 outline-none focus:border-brand"
              />
            </div>
          </div>

          {error && (
            <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>
          )}

          <button disabled={loading} className="btn btn-primary justify-center">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'ورود'}
          </button>
        </form>
        <p className="text-center text-white/30 text-xs mt-5">
          با شماره موبایل و رمز عبور وارد شوید
        </p>
      </div>
    </div>
  );
}
