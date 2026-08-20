'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { addToCart, getCart } from '@/lib/api';
import { Toast } from '@/components/ui/Toast';

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  maxStock?: number;
  initialQuantity?: number;
  onQuantityChange?: (qty: number) => void;
  showUpsell?: boolean;
  relatedProducts?: Array<{ id: number; name: string; price: number; image?: string }>;
}

export default function AddToCartButton({
  productId,
  disabled = false,
  maxStock = 0,
  initialQuantity = 1,
  onQuantityChange,
  showUpsell = false,
  relatedProducts = [],
}: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
  const isLowStock = availableStock > 0 && availableStock < 5;
  const isOutOfStock = disabled || maxStock === 0 || availableStock === 0;

  const getButtonState = () => {
    if (isOutOfStock) return 'out-of-stock';
    if (loading) return 'loading';
    if (isAnimating) return 'animating';
    if (isLowStock) return 'low-stock';
    return 'available';
  };

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
    setIsAnimating(true);
    try {
      await addToCart(productId, quantity);
      setToast({ message: `✅ ${quantity} عدد به سبد خرید اضافه شد`, type: 'success' });
      setShowSuccessMessage(true);
      setQuantity(1);
      setCartQuantity((prev) => prev + quantity);
      if (onQuantityChange) onQuantityChange(1);
      window.dispatchEvent(new CustomEvent('cart-updated'));

      // Reset animation after 1.5 seconds
      setTimeout(() => {
        setIsAnimating(false);
        setShowSuccessMessage(false);
      }, 1500);
    } catch {
      setToast({ message: '❌ خطا در افزودن به سبد خرید', type: 'error' });
      setIsAnimating(false);
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

  const getButtonStyles = () => {
    const state = getButtonState();
    switch (state) {
      case 'out-of-stock':
        return 'bg-gray-200 text-gray-500 cursor-not-allowed';
      case 'loading':
        return 'bg-brand/80 text-white cursor-wait';
      case 'animating':
        return 'bg-green-600 text-white scale-95';
      case 'low-stock':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      default:
        return 'bg-brand text-white hover:bg-brand-dark';
    }
  };

  const getButtonText = () => {
    const state = getButtonState();
    switch (state) {
      case 'out-of-stock':
        return cartQuantity > 0 ? 'تکمیل شده' : 'ناموجود';
      case 'loading':
        return 'در حال افزودن...';
      case 'animating':
        return '✨ اضافه شد!';
      case 'low-stock':
        return `⚠️ فقط ${availableStock} عدد باقی مانده`;
      default:
        return 'افزودن به سبد خرید';
    }
  };

  if (isOutOfStock) {
    return (
      <div className="w-full">
        <button
          disabled
          className={`btn w-full justify-center ${getButtonStyles()} flex items-center gap-2`}
        >
          <ShoppingCart size={18} /> {getButtonText()}
        </button>
        {cartQuantity > 0 && (
          <p className="text-xs text-brand mt-2 text-center">
            ✅ {cartQuantity} عدد در سبد خرید شما موجود است
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="flex items-center gap-1 bg-surface border border-line rounded-xl px-1 py-1 w-full sm:w-auto">
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

            <span className="text-xs text-muted pr-2 border-r border-line pl-2 min-w-[60px]">
              موجودی: {availableStock}
              {cartQuantity > 0 && (
                <span className="block text-[10px] text-brand">({cartQuantity} در سبد)</span>
              )}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={loading || isOutOfStock}
            className={`btn ${getButtonStyles()} flex-1 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto transition-all duration-300`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isAnimating ? (
              <Check size={18} />
            ) : (
              <ShoppingCart size={18} />
            )}
            {getButtonText()}
          </button>
        </div>

        {/* Stock warning */}
        {isLowStock && !loading && !isAnimating && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-2 text-sm">
            <AlertCircle size={16} />
            <span>تعداد محدود! فقط {availableStock} عدد در انبار موجود است</span>
          </div>
        )}

        {/* Success message with animation */}
        {showSuccessMessage && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-2 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Check size={16} />
            <span>✨ با موفقیت به سبد خرید اضافه شد!</span>
          </div>
        )}

        {/* Upsell products */}
        {showUpsell && relatedProducts.length > 0 && showSuccessMessage && (
          <div className="mt-4 p-4 bg-brand-soft rounded-xl border border-brand/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm font-bold text-brand mb-3">
              💡 ممکن است به اینها هم نیاز داشته باشید:
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {relatedProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="min-w-[120px] bg-white rounded-xl border border-line p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  {product.image && (
                    <div className="w-full h-16 rounded-lg bg-surface mb-2 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs font-bold text-ink truncate">{product.name}</p>
                  <p className="text-xs text-brand font-bold mt-1">
                    {product.price.toLocaleString()} ریال
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
