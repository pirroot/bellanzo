"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ServiceRequestStatus } from "@/lib/types";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-zinc-200 text-zinc-700",
};

export default function TrackRequest() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ServiceRequestStatus | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch<ServiceRequestStatus>(
        `/service-requests/track/?code=${encodeURIComponent(code.trim())}`
      );
      setResult(data);
    } catch {
      setError("کد پیگیری یافت نشد. لطفاً دوباره بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-line p-7 md:p-9">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="کد پیگیری مثل A1B2C3D4"
          dir="ltr"
          className="flex-1 rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors tracking-widest text-center font-bold"
        />
        <button disabled={loading} className="btn btn-primary justify-center">
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Search size={18} /> پیگیری
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="mt-5 text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border-t border-line pt-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-brand-soft text-brand">
              <PackageSearch size={24} />
            </span>
            <div>
              <div className="font-black text-ink">{result.full_name}</div>
              <div className="text-sm text-muted">
                کد پیگیری: {result.tracking_code}
              </div>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Info label="نوع درخواست" value={result.request_type_display} />
            <Info label="محصول" value={result.product_name || "—"} />
            <div>
              <dt className="text-muted mb-1">وضعیت</dt>
              <dd>
                <span
                  className={`inline-block px-3 py-1 rounded-full font-bold ${
                    statusColors[result.status] || "bg-zinc-100"
                  }`}
                >
                  {result.status_display}
                </span>
              </dd>
            </div>
            <Info
              label="آخرین بروزرسانی"
              value={new Date(result.updated_at).toLocaleDateString("fa-IR")}
            />
          </dl>

          {result.admin_note && (
            <div className="mt-5 flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <span className="text-amber-500 mt-0.5 shrink-0">💬</span>
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1">پیام از تیم پشتیبانی</p>
                <p className="text-sm text-amber-900 leading-7">{result.admin_note}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted mb-1">{label}</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  );
}
