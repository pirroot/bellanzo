"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const types = [
  { value: "repair", label: "تعمیر" },
  { value: "warranty", label: "گارانتی" },
  { value: "install", label: "نصب و راه‌اندازی" },
  { value: "question", label: "سوال / راهنمایی" },
  { value: "other", label: "سایر" },
];

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors";
const label = "block text-sm font-bold text-ink-soft mb-2";

export default function ServiceRequestForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await apiFetch<{ tracking_code: string }>(
        "/service-requests/",
        { method: "POST", body: form }
      );
      setCode(res.tracking_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white rounded-3xl border border-line p-10"
      >
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand mb-5">
          <CheckCircle2 size={34} />
        </span>
        <h3 className="text-2xl font-black text-ink">درخواست شما ثبت شد!</h3>
        <p className="mt-2 text-muted">
          کد پیگیری زیر را برای دنبال‌کردن وضعیت درخواست نگه دارید:
        </p>
        <div className="mt-6 inline-flex items-center gap-3 bg-ink text-white rounded-2xl px-6 py-4">
          <span className="text-2xl font-black tracking-widest">{code}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="text-white/70 hover:text-brand"
            aria-label="کپی"
          >
            <Copy size={20} />
          </button>
        </div>
        {copied && <p className="mt-2 text-sm text-brand">کپی شد!</p>}
        <div className="mt-8">
          <button onClick={() => setCode("")} className="btn btn-outline">
            ثبت درخواست جدید
          </button>
        </div>
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
          <input name="phone" required className={field} dir="ltr" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>نوع درخواست *</label>
          <select name="request_type" className={field} defaultValue="repair">
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>ایمیل</label>
          <input name="email" type="email" className={field} dir="ltr" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>نام محصول</label>
          <input name="product_name" className={field} />
        </div>
        <div>
          <label className={label}>شماره سریال</label>
          <input name="serial_number" className={field} dir="ltr" />
        </div>
      </div>

      <div>
        <label className={label}>شرح مشکل / درخواست *</label>
        <textarea name="description" required rows={4} className={field} />
      </div>

      <div>
        <label className={label}>پیوست (اختیاری)</label>
        <input
          name="attachment"
          type="file"
          className="block w-full text-sm text-muted file:ml-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-brand file:font-bold"
        />
      </div>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <button disabled={loading} className="btn btn-primary justify-center">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> در حال ثبت...
          </>
        ) : (
          "ثبت درخواست"
        )}
      </button>
    </form>
  );
}
