'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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

export default function AdminOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Order>(`/admin/orders/${id}/`, { auth: true });
      setOrder(data);
      setStatus(data.status);
      setTrackingCode(data.tracking_code || '');
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err.message || 'خطا در بارگذاری سفارش');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await apiFetch(`/admin/orders/${order.id}/update_status/`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ status, tracking_code: trackingCode }),
      });
      await loadOrder();
    } catch (err: any) {
      setError(err.message || 'خطا در بروزرسانی وضعیت');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-brand mb-4">{error || 'سفارش یافت نشد'}</p>
        <Link href="/admin/orders" className="btn btn-primary text-sm">
          بازگشت به سفارشات
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        بازگشت به سفارشات
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">سفارش #{order.id}</h1>
          <p className="text-muted text-sm">
            {new Date(order.created_at).toLocaleDateString('fa-IR')}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status] || 'bg-gray-100'}`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-line p-6">
            <h3 className="font-bold text-lg mb-4">اطلاعات مشتری</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-bold">نام:</span> {order.full_name}
              </p>
              <p>
                <span className="font-bold">تلفن:</span> {order.phone}
              </p>
              <p>
                <span className="font-bold">آدرس:</span> {order.address}
              </p>
              {order.postal_code && (
                <p>
                  <span className="font-bold">کد پستی:</span> {order.postal_code}
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-3xl border border-line p-6">
            <h3 className="font-bold text-lg mb-4">محصولات</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b border-line pb-3 last:border-0"
                >
                  <div>
                    <p className="font-bold">{item.product_name}</p>
                    <p className="text-sm text-muted">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <div className="font-bold">{formatPrice(item.subtotal)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-line pt-4 mt-4 flex justify-between text-lg font-bold">
              <span>مجموع</span>
              <span className="text-brand">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-line p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">تغییر وضعیت</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">وضعیت</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none"
                >
                  <option value="paid">پرداخت شده</option>
                  <option value="shipped">ارسال شده</option>
                  <option value="delivered">تحویل شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">کد رهگیری</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="کد رهگیری را وارد کنید"
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="btn btn-primary w-full justify-center"
              >
                {updating ? <RefreshCw size={18} className="animate-spin" /> : 'بروزرسانی وضعیت'}
              </button>

              {order.tracking_code && (
                <div className="text-center text-sm text-brand font-bold">
                  کد رهگیری فعلی: {order.tracking_code}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
