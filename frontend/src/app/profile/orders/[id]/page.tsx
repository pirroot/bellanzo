'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrder } from '@/lib/api';
import type { Order } from '@/lib/types';
import { mediaUrl } from '@/lib/api';
import { ChevronLeft, Truck, CheckCircle, Clock, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcon: Record<string, any> = {
  pending: Clock,
  paid: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrder(Number(id));
      setOrder(data);
    } catch {
      setError('سفارش یافت نشد');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/profile/orders" className="text-brand hover:underline">
          بازگشت به تاریخچه سفارشات
        </Link>
      </div>
    );
  }

  const StatusIcon = statusIcon[order.status] || Clock;

  return (
    <div className="container-x py-12 max-w-3xl mt-20">
      <Link
        href="/profile/orders"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        بازگشت به تاریخچه سفارشات
      </Link>

      <div className="bg-white border border-line rounded-3xl p-6">
        <div className="flex flex-wrap justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-black">سفارش #{order.id}</h1>
            <p className="text-muted text-sm">
              {new Date(order.created_at).toLocaleDateString('fa-IR')}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status] || 'bg-gray-100'}`}
          >
            <StatusIcon size={16} />
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <div className="space-y-2 text-sm border-b border-line pb-4 mb-4">
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
          {order.tracking_code && (
            <p>
              <span className="font-bold">کد رهگیری:</span>{' '}
              <span className="text-brand font-bold">{order.tracking_code}</span>
            </p>
          )}
        </div>

        <h3 className="font-bold mb-3">محصولات</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-center border-b border-line pb-3 last:border-0"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                {item.product_image && (
                  <Image
                    src={mediaUrl(item.product_image) || ''}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold">{item.product_name}</p>
                <p className="text-sm text-muted">
                  {item.quantity} × {formatPrice(item.unit_price)}
                </p>
              </div>
              <div className="font-bold text-brand">{formatPrice(item.subtotal)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-4 mt-4 text-left">
          <div className="text-2xl font-black">مجموع: {formatPrice(order.total)}</div>
        </div>
      </div>
    </div>
  );
}
