'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { addToCart } from '@/lib/api';
import { Toast } from '@/components/ui/Toast';

export default function AddToCartButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      await addToCart(productId, 1);
      setToast({ message: '✅ محصول با موفقیت به سبد خرید اضافه شد', type: 'success' });
    } catch (err) {
      setToast({ message: '❌ خطا در افزودن به سبد خرید', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="btn btn-primary text-base flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
        افزودن به سبد خرید
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
