'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, Star, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Feedback {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  product_model: string;
  rating: number;
  message: string;
  created_at: string;
}

export default function FeedbacksAdmin() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/feedbacks/', { auth: true });
      setFeedbacks(Array.isArray(data) ? data : data?.results || []);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err.message || 'خطا در بارگذاری');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: number) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;
    try {
      await apiFetch(`/feedbacks/${id}/`, { method: 'DELETE', auth: true });
      await loadFeedbacks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در حذف');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">نظرات کاربران</h1>
          <p className="text-muted text-sm">مدیریت نظرات و امتیازات</p>
        </div>
        <button
          onClick={loadFeedbacks}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line hover:bg-surface transition-colors text-sm"
        >
          <RefreshCw size={16} /> بروزرسانی
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-muted">هیچ نظری ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white rounded-3xl border border-line p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold">{f.full_name}</span>
                    <span className="text-sm text-muted">{f.phone}</span>
                    {f.product_model && (
                      <span className="text-sm text-muted">| {f.product_model}</span>
                    )}
                    <span className="flex items-center gap-1 text-brand text-sm font-bold">
                      <Star className="w-4 h-4 fill-brand text-brand" /> {f.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-2 leading-7">{f.message}</p>
                  <div className="text-xs text-muted mt-2">
                    {new Date(f.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                {/* <button
                  onClick={() => deleteFeedback(f.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
