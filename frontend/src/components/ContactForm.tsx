"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { apiFetch } from "@/lib/api";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors";
const label = "block text-sm font-bold text-ink-soft mb-2";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch("/messages/", {
        method: "POST",
        body: JSON.stringify({
          full_name: fd.get("full_name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
        }),
      });
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
        <h3 className="text-2xl font-black text-ink">پیام شما ارسال شد!</h3>
        <p className="mt-2 text-muted">در اولین فرصت با شما تماس می‌گیریم.</p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl border border-line p-7 md:p-9 grid gap-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>نام و نام خانوادگی *</label>
          <input name="full_name" required className={field} />
        </div>
        <div>
          <label className={label}>شماره تماس *</label>
          <input name="phone" required dir="ltr" className={field} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>ایمیل</label>
          <input name="email" type="email" dir="ltr" className={field} />
        </div>
        <div>
          <label className={label}>موضوع *</label>
          <select name="subject" required className={field}>
            <option value="">انتخاب کنید...</option>
            <option value="درخواست اخذ نمایندگی فروش">درخواست اخذ نمایندگی فروش</option>
            <option value="درخواست اخذ نمایندگی خدمات پس از فروش">درخواست اخذ نمایندگی خدمات پس از فروش</option>
            <option value="ارتباط با کارشناسان">ارتباط با کارشناسان</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label}>پیام *</label>
        <textarea name="message" required rows={5} className={field} />
      </div>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <button disabled={loading} className="btn btn-primary justify-center">
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Send size={18} /> ارسال پیام
          </>
        )}
      </button>
    </form>
  );
}
