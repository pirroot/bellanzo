'use client';

import Reveal from '@/components/ui/Reveal';
import { clearCart, getCart, mediaUrl, removeFromCart, updateCartQuantity } from '@/lib/api';
import type { Cart as CartType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
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

  const handleUpdateQuantity = async (
    productId: number,
    quantity: number,
    maxStock: number = 999
  ) => {
    if (quantity < 1) return;
    if (quantity > maxStock) {
      alert(`فقط ${maxStock} عدد از این محصول موجود است.`);
      return;
    }

    setUpdating(productId);
    try {
      await updateCartQuantity(productId, quantity);
      await loadCart();
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch {
      setError('خطا در بروزرسانی تعداد');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromCart(productId);
      await loadCart();
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch {
      setError('خطا در حذف محصول');
    }
  };

  const handleClear = async () => {
    if (!confirm('آیا از خالی کردن سبد خرید اطمینان دارید؟')) return;
    try {
      await clearCart();
      await loadCart();
      window.dispatchEvent(new CustomEvent('cart-updated'));
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 mt-20">
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

                  {/* قیمت با تخفیف */}
                  <div className="text-sm text-muted mt-1">
                    {item.product_discount_price > 0 ? (
                      <div>
                        <span className="line-through text-muted">
                          {formatPrice(item.product_price)} ریال
                        </span>
                        <span className="text-brand font-bold mr-2">
                          {formatPrice(item.product_discount_price)} ریال
                        </span>
                      </div>
                    ) : (
                      <span>{formatPrice(item.product_price)} ریال</span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.product, item.quantity - 1, item.max_stock)
                      }
                      disabled={item.quantity <= 1 || updating === item.product}
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-brand transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          handleUpdateQuantity(item.product, val, item.max_stock);
                        }
                      }}
                      min={1}
                      className="w-12 text-center font-bold bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.product, item.quantity + 1, item.max_stock)
                      }
                      disabled={
                        item.quantity >= (item.max_stock || 999) || updating === item.product
                      }
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-brand transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>

                    <span className="text-xs text-muted">موجودی: {item.max_stock || 0}</span>

                    <button
                      onClick={() => handleRemove(item.product)}
                      className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors mr-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-lg font-bold text-ink whitespace-nowrap">
                  {formatPrice(item.subtotal)} ریال
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
                <span className="font-bold">{cart.items_count}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-line pt-4 mt-4">
                <span>مجموع</span>
                <span className="text-brand">{formatPrice(cart.total)} ریال</span>
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
