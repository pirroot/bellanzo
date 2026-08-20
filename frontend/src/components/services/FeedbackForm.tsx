'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    product_model: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/feedbacks/', {
        method: 'POST',
        body: JSON.stringify({ ...form, rating }),
      });
      setSuccess(true);
      setForm({ full_name: '', phone: '', email: '', product_model: '', message: '' });
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white rounded-3xl border border-line p-10"
      >
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand mb-5">
          <CheckCircle2 size={34} />
        </span>
        <h3 className="text-2xl font-black text-ink">نظر شما ثبت شد!</h3>
        <button onClick={() => setSuccess(false)} className="btn btn-outline mt-6">
          ثبت نظر جدید
        </button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-line p-7 md:p-9 grid gap-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold mb-2">نام و نام خانوادگی *</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">شماره تماس *</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold mb-2">ایمیل</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">مدل کالا</label>
          <input
            value={form.product_model}
            onChange={(e) => setForm({ ...form, product_model: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">امتیاز شما</label>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-brand text-brand' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm text-muted font-bold">{rating} از ۵ ستاره</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">متن نظر *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
          placeholder="نظر خود را بنویسید..."
        />
      </div>

      {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

      <button disabled={loading} className="btn btn-primary justify-center flex items-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {loading ? 'در حال ارسال...' : 'ارسال نظر'}
      </button>
    </form>
  );
}
