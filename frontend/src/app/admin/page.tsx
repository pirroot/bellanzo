'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Clock,
  CheckCircle2,
  Inbox,
  Star,
  MessageSquare,
  ArrowLeft,
  Package,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Stats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  surveys: number;
  unread_messages: number;
  orders_count: number;
  users_count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Stats>('/service-requests/stats/', { auth: true })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const cards = stats
    ? [
        { label: 'کل درخواست‌ها', value: stats.total, icon: Inbox, color: 'bg-ink' },
        { label: 'درخواست جدید', value: stats.new, icon: Headphones, color: 'bg-brand' },
        { label: 'در حال بررسی', value: stats.in_progress, icon: Clock, color: 'bg-amber-500' },
        { label: 'حل شده', value: stats.resolved, icon: CheckCircle2, color: 'bg-green-600' },
        { label: 'نظرسنجی‌ها', value: stats.surveys, icon: Star, color: 'bg-ink' },
        {
          label: 'پیام خوانده‌نشده',
          value: stats.unread_messages,
          icon: MessageSquare,
          color: 'bg-brand',
        },
        {
          label: 'سفارشات',
          value: stats.orders_count || 0,
          icon: ShoppingBag,
          color: 'bg-blue-600',
        },
        { label: 'کاربران', value: stats.users_count || 0, icon: Users, color: 'bg-purple-600' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-black text-ink mb-1">داشبورد</h1>
      <p className="text-muted mb-8">نمای کلی درخواست‌ها و فعالیت‌ها</p>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm mb-6">{error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-3xl border border-line p-6 flex items-center gap-4"
          >
            <span className={`grid place-items-center w-14 h-14 rounded-2xl text-white ${c.color}`}>
              <c.icon size={26} />
            </span>
            <div>
              <div className="text-3xl font-black text-ink">{c.value}</div>
              <div className="text-sm text-muted">{c.label}</div>
            </div>
          </div>
        ))}
        {!stats && !error && <p className="text-muted">در حال بارگذاری...</p>}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        <Link
          href="/admin/orders"
          className="group bg-blue-600 text-white rounded-3xl p-7 flex items-center justify-between"
        >
          <div>
            <h3 className="font-black text-lg">سفارشات</h3>
            <p className="text-white/70 text-sm mt-1">مدیریت و پیگیری سفارشات</p>
          </div>
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/requests"
          className="group bg-ink text-white rounded-3xl p-7 flex items-center justify-between"
        >
          <div>
            <h3 className="font-black text-lg">درخواست‌های خدمات</h3>
            <p className="text-white/50 text-sm mt-1">مشاهده و بروزرسانی وضعیت</p>
          </div>
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/messages"
          className="group bg-brand text-white rounded-3xl p-7 flex items-center justify-between"
        >
          <div>
            <h3 className="font-black text-lg">پیام‌های تماس</h3>
            <p className="text-white/70 text-sm mt-1">پاسخ به پیام‌های دریافتی</p>
          </div>
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/products"
          className="group bg-emerald-600 text-white rounded-3xl p-7 flex items-center justify-between"
        >
          <div>
            <h3 className="font-black text-lg">محصولات</h3>
            <p className="text-white/70 text-sm mt-1">مدیریت کاتالوگ محصولات</p>
          </div>
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/users"
          className="group bg-purple-600 text-white rounded-3xl p-7 flex items-center justify-between"
        >
          <div>
            <h3 className="font-black text-lg">کاربران</h3>
            <p className="text-white/70 text-sm mt-1">مدیریت کاربران سایت</p>
          </div>
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
