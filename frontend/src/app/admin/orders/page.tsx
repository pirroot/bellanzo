'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Eye, Truck, CheckCircle, XCircle, Clock, RefreshCw, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

const statusColors: Record<string, string> = {
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

const statusIcon: Record<string, any> = {
  paid: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const filterOptions = [
  { value: 'all', label: 'همه' },
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'shipped', label: 'ارسال شده' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'cancelled', label: 'لغو شده' },
];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/admin/orders/', { auth: true });
      const ordersList = Array.isArray(data) ? data : data?.results || [];
      setOrders(ordersList);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err.message || 'خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filter === 'all'
      ? orders.filter((order) => order.status !== 'pending')
      : orders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-brand mb-4">{error}</p>
        <button onClick={loadOrders} className="btn btn-primary text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">سفارشات</h1>
          <p className="text-muted text-sm">مدیریت و پیگیری سفارشات</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line hover:bg-surface transition-colors text-sm"
        >
          <RefreshCw size={16} />
          بروزرسانی
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={18} className="text-muted" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              filter === opt.value
                ? 'bg-brand text-white'
                : 'bg-white border border-line text-ink-soft hover:border-brand'
            }`}
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span className="mr-1 text-xs opacity-70">
                ({orders.filter((o) => o.status === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <Package size={64} className="mx-auto text-line mb-4" />
          <p className="text-muted">هیچ سفارشی با این وضعیت یافت نشد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-4 font-bold">#</th>
                <th className="text-right p-4 font-bold">مشتری</th>
                <th className="text-right p-4 font-bold hidden sm:table-cell">تلفن</th>
                <th className="text-right p-4 font-bold">وضعیت</th>
                <th className="text-right p-4 font-bold hidden md:table-cell">تاریخ</th>
                <th className="text-right p-4 font-bold">مبلغ</th>
                <th className="text-right p-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcon[order.status] || Clock;
                return (
                  <tr
                    key={order.id}
                    className="border-t border-line hover:bg-surface transition-colors"
                  >
                    <td className="p-4 font-bold text-ink">#{order.id}</td>
                    <td className="p-4 font-medium">{order.full_name}</td>
                    <td className="p-4 text-muted hidden sm:table-cell">{order.phone}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}
                      >
                        <StatusIcon size={14} />
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4 font-bold text-ink">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="inline-flex items-center gap-1 text-brand hover:underline text-sm font-bold"
                      >
                        <Eye size={16} />
                        مشاهده
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
