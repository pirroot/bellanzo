'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrderHistory, cancelOrder } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Package, ChevronLeft, XCircle, Truck, CheckCircle, Clock, X } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { formatPrice } from '@/lib/utils';

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

const statusIcon: Record<string, any> = {
  pending: Clock,
  paid: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrderHistory();
      setOrders(data);
    } catch {
      setError('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('آیا از لغو این سفارش اطمینان دارید؟')) return;
    try {
      await cancelOrder(id);
      await loadOrders();
    } catch {
      setError('خطا در لغو سفارش');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Package size={80} className="text-line" />
        <h2 className="text-2xl font-black">تاریخچه سفارشات خالی است</h2>
        <p className="text-muted">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
        <Link href="/products" className="btn btn-primary">
          شروع خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 mt-20">
      <h1 className="text-3xl font-black mb-8">تاریخچه سفارشات</h1>

      <div className="space-y-4">
        {orders.map((order, i) => {
          const StatusIcon = statusIcon[order.status] || Clock;
          return (
            <Reveal key={order.id} delay={i * 0.05}>
              <div className="bg-white border border-line rounded-3xl p-6 card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black">سفارش #{order.id}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}
                      >
                        <StatusIcon size={14} />
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted mt-1">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </div>
                    <div className="text-sm text-muted">{order.items.length} محصول</div>
                    {order.tracking_code && (
                      <div className="text-sm text-brand mt-1 font-bold">
                        کد رهگیری: {order.tracking_code}
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <div className="text-xl font-black">{formatPrice(order.total)}</div>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-2"
                      >
                        <XCircle size={16} />
                        لغو سفارش
                      </button>
                    )}
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="text-sm text-brand hover:text-brand-dark flex items-center gap-1 mt-1"
                    >
                      مشاهده جزئیات
                      <ChevronLeft size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
