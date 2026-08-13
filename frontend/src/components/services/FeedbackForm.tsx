"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors";

export default function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    for (const [k, v] of fd.entries()) body[k] = v as string;
    try {
      await apiFetch("/feedbacks/", { method: "POST", body: JSON.stringify(body) });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white rounded-3xl border border-line p-10"
      >
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand mb-5">
          <CheckCircle2 size={34} />
        </span>
        <h3 className="text-2xl font-black text-ink">پیام شما ثبت شد!</h3>
        <p className="mt-2 text-muted">
          از اینکه وقت گذاشتید و نظر خود را با ما در میان گذاشتید سپاسگزاریم.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl border border-line p-7 md:p-9 grid gap-5"
    >
      <h3 className="font-black text-lg text-ink border-b border-line pb-4">
        انتقادات و پیشنهادات
      </h3>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">
            نام و نام خانوادگی <span className="text-brand">*</span>
          </label>
          <input name="full_name" required className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">
            شماره تماس <span className="text-brand">*</span>
          </label>
          <input name="phone" required dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">مدل کالا</label>
          <input name="product_model" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">تاریخ خرید</label>
          <input name="purchase_date" type="date" dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شماره سریال</label>
          <input name="serial_number" dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">آدرس ایمیل</label>
          <input name="email" type="email" dir="ltr" className={field} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">
          متن انتقاد و پیشنهادات <span className="text-brand">*</span>
        </label>
        <textarea name="message" required rows={5} className={field} />
      </div>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>
      )}

      <button disabled={loading} className="btn btn-primary justify-center">
        {loading ? <Loader2 size={18} className="animate-spin" /> : "ارسال"}
      </button>
    </form>
  );
}
