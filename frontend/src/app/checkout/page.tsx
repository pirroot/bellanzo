'use client';

import Reveal from '@/components/ui/Reveal';
import { createOrder, getCart, initiatePayment, apiFetch } from '@/lib/api';
import type { Cart as CartType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Settings {
  shipping_cost: number;
  free_shipping_threshold: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cartData, settingsData] = await Promise.all([
        getCart(),
        apiFetch<Settings>('/settings/', { auth: false }),
      ]);
      setCart(cartData);
      setShippingCost(settingsData?.shipping_cost || 0);
      setFreeThreshold(settingsData?.free_shipping_threshold || 0);
    } catch {
      setError('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart?.total || 0;
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const finalShipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + finalShipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder(form);
      const payment = await initiatePayment(order.id);
      window.location.href = payment.gateway_url;
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت سفارش');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-black">سبد خرید خالی است</h2>
        <p className="text-muted">برای ثبت سفارش، ابتدا محصولات را به سبد خرید اضافه کنید.</p>
        <Link href="/products" className="btn btn-primary">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 mt-20">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        بازگشت به سبد خرید
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Reveal>
            <div className="bg-white border border-line rounded-3xl p-6">
              <h1 className="text-2xl font-black mb-6">تکمیل اطلاعات</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">شماره موبایل *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors"
                    placeholder="09123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">آدرس *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors resize-none"
                    placeholder="آدرس کامل خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">کد پستی</label>
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors"
                    placeholder="کد پستی (اختیاری)"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full text-base disabled:opacity-50"
                >
                  {submitting ? 'در حال پردازش...' : `پرداخت ${formatPrice(total)} ریال`}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted mt-4">
                  <ShieldCheck size={16} className="text-brand" />
                  اطلاعات شما محفوظ است
                </div>
              </form>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-1">
          <Reveal delay={0.1}>
            <div className="bg-white border border-line rounded-3xl p-6 sticky top-24">
              <h3 className="text-xl font-black mb-4">خلاصه سفارش</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-bold">{formatPrice(item.subtotal)} ریال</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-line pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">جمع سبد خرید</span>
                  <span className="font-bold">{formatPrice(subtotal)} ریال</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted flex items-center gap-1">
                    <Truck size={14} /> هزینه ارسال
                  </span>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-green-600">رایگان</span>
                    ) : (
                      formatPrice(finalShipping) + ' ریال'
                    )}
                  </span>
                </div>
                {isFreeShipping && (
                  <div className="text-xs text-green-600 text-center">
                    🎉 ارسال رایگان برای سفارشات بالای {formatPrice(freeThreshold)} ریال
                  </div>
                )}
                <div className="border-t border-line pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>مجموع</span>
                    <span className="text-brand">{formatPrice(total)} ریال</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
