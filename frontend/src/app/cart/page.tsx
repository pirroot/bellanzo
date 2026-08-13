'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCart, updateCartQuantity, removeFromCart, clearCart } from '@/lib/api';
import type { Cart as CartType } from '@/lib/types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import Reveal from '@/components/ui/Reveal';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch {
      setError('خطا در بارگذاری سبد خرید');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartQuantity(productId, quantity);
      await loadCart();
    } catch {
      setError('خطا در بروزرسانی تعداد');
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromCart(productId);
      await loadCart();
    } catch {
      setError('خطا در حذف محصول');
    }
  };

  const handleClear = async () => {
    if (!confirm('آیا از خالی کردن سبد خرید اطمینان دارید؟')) return;
    try {
      await clearCart();
      await loadCart();
    } catch {
      setError('خطا در خالی کردن سبد');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 ">
        <ShoppingBag size={80} className="text-line" />
        <h2 className="text-2xl font-black">سبد خرید خالی است</h2>
        <p className="text-muted">برای شروع خرید، به صفحه محصولات بروید.</p>
        <Link href="/products" className="btn btn-primary">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 mt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">سبد خرید</h1>
        <button
          onClick={handleClear}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          خالی کردن سبد
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <div className="bg-white border border-line rounded-3xl p-4 flex gap-4 items-center card-hover">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0">
                  {item.product_image ? (
                    <Image
                      src={mediaUrl(item.product_image) || ''}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-line">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Link
                    href={`/products/${item.product}`}
                    className="font-bold hover:text-brand transition-colors"
                  >
                    {item.product_name}
                  </Link>
                  <div className="text-sm text-muted mt-1">
                    {formatPrice(item.product_price)} تومان
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.product, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-brand transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />

                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-brand transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => handleRemove(item.product)}
                      className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors mr-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-lg font-bold text-ink whitespace-nowrap">
                  {formatPrice(item.subtotal)} تومان
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-line rounded-3xl p-6 sticky top-24">
            <h3 className="text-xl font-black mb-4">خلاصه سفارش</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">تعداد اقلام</span>
                <span className="font-bold">{formatPrice(cart.items_count)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-line pt-4 mt-4">
                <span>مجموع</span>
                <span className="text-brand">{formatPrice(cart.total)} تومان</span>
              </div>
            </div>
            <Link href="/checkout" className="btn btn-primary w-full mt-6">
              ادامه فرآیند خرید
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 text-sm text-muted hover:text-brand transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
