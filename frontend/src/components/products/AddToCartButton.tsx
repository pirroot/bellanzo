'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, Plus, Minus } from 'lucide-react';
import { addToCart, getCart } from '@/lib/api';
import { Toast } from '@/components/ui/Toast';

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  maxStock?: number;
  initialQuantity?: number;
  onQuantityChange?: (qty: number) => void;
}

export default function AddToCartButton({
  productId,
  disabled = false,
  maxStock = 0,
  initialQuantity = 1,
  onQuantityChange,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Get current cart quantity for this product
  useEffect(() => {
    const fetchCartQuantity = async () => {
      try {
        const cart = await getCart();
        const item = cart.items.find((i) => i.product === productId);
        setCartQuantity(item?.quantity || 0);
      } catch {
        // Cart not available
      }
    };
    fetchCartQuantity();
  }, [productId]);

  // Reset quantity when maxStock changes
  useEffect(() => {
    setQuantity(Math.min(initialQuantity, maxStock || 1));
  }, [maxStock, initialQuantity]);

  const availableStock = maxStock - cartQuantity;

  const handleAdd = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (quantity > availableStock) {
      setToast({
        message: `❌ فقط ${availableStock} عدد دیگر قابل افزودن است (${cartQuantity} عدد در سبد دارید)`,
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await addToCart(productId, quantity);
      setToast({ message: `✅ ${quantity} عدد به سبد خرید اضافه شد`, type: 'success' });
      setQuantity(1);
      setCartQuantity((prev) => prev + quantity);
      if (onQuantityChange) onQuantityChange(1);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch {
      setToast({ message: '❌ خطا در افزودن به سبد خرید', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const increaseQty = () => {
    if (quantity < availableStock) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      if (onQuantityChange) onQuantityChange(newQty);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      if (onQuantityChange) onQuantityChange(newQty);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
      if (onQuantityChange) onQuantityChange(1);
      return;
    }
    const newQty = Math.min(val, availableStock);
    setQuantity(newQty);
    if (onQuantityChange) onQuantityChange(newQty);
  };

  if (disabled || maxStock === 0 || availableStock === 0) {
    return (
      <button
        disabled
        className="btn bg-gray-200 text-gray-500 cursor-not-allowed flex items-center gap-2 w-full justify-center"
      >
        <ShoppingCart size={18} /> {cartQuantity > 0 ? 'تکمیل شده' : 'ناموجود'}
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="flex items-center gap-1 bg-surface border border-line rounded-xl px-1 py-1">
          <button
            onClick={decreaseQty}
            disabled={quantity <= 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-brand-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="کاهش تعداد"
          >
            <Minus size={16} />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min={1}
            max={availableStock}
            className="w-12 text-center font-bold text-lg bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="تعداد"
          />

          <button
            onClick={increaseQty}
            disabled={quantity >= availableStock}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-brand-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="افزایش تعداد"
          >
            <Plus size={16} />
          </button>

          <span className="text-xs text-muted pr-2 border-r border-line pl-2">
            موجودی: {availableStock}
            {cartQuantity > 0 && (
              <span className="block text-[10px] text-brand">({cartQuantity} در سبد)</span>
            )}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
          افزودن به سبد خرید
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
