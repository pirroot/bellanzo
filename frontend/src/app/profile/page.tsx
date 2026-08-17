'use client';

import Reveal from '@/components/ui/Reveal';
import { apiFetch, getOrderHistory } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Edit2, LogOut, Package, Save, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

export default function ProfilePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; phone: string; full_name: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setEditName(userData.full_name || '');
    } catch {}

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrderHistory();
      setOrders(data);
    } catch {
      // Error loading orders
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = await apiFetch<{ full_name: string }>(`/auth/profile/${user.id}/`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ full_name: editName }),
      });
      const updatedUser = { ...user, full_name: data.full_name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
    } catch {
      alert('خطا در بروزرسانی اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container-x py-12 mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-line rounded-3xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
                <User size={28} className="text-brand" />
              </div>
              <div>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1 rounded-xl border border-line focus:border-brand outline-none text-lg font-black"
                      placeholder="نام خود را وارد کنید"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditName(user?.full_name || '');
                      }}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black">{user?.full_name || 'کاربر'}</h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-xl hover:bg-surface transition-colors text-muted hover:text-ink"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted">{user?.phone || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-line rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-brand">{orders.length}</div>
            <div className="text-sm text-muted">کل سفارشات</div>
          </div>
          <div className="bg-white border border-line rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-600">
              {orders.filter((o) => o.status === 'pending').length}
            </div>
            <div className="text-sm text-muted">در انتظار پرداخت</div>
          </div>
          <div className="bg-white border border-line rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-blue-600">
              {orders.filter((o) => o.status === 'shipped').length}
            </div>
            <div className="text-sm text-muted">در حال ارسال</div>
          </div>
          <div className="bg-white border border-line rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-600">
              {orders.filter((o) => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-muted">تحویل شده</div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-2xl font-black mb-4">سفارشات اخیر</h2>

        {orders.length === 0 ? (
          <div className="bg-white border border-line rounded-3xl p-12 text-center">
            <Package size={64} className="mx-auto text-line mb-4" />
            <p className="text-muted">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
            <Link href="/products" className="btn btn-primary mt-4 inline-block">
              شروع خرید
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((order, i) => (
              <Reveal key={order.id} delay={i * 0.03}>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className="block bg-white border border-line rounded-2xl p-4 card-hover"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">#{order.id}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </span>
                      <span className="font-bold">{order.total.toLocaleString()} ریال</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}

            {orders.length > 10 && (
              <Link
                href="/profile/orders"
                className="block text-center text-brand hover:underline text-sm mt-4"
              >
                مشاهده همه سفارشات
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
