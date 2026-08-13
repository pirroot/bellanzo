"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, X, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/lib/types";

interface ServiceRequest {
  id: number;
  tracking_code: string;
  full_name: string;
  phone: string;
  email: string;
  request_type: string;
  request_type_display: string;
  product_name: string;
  serial_number: string;
  description: string;
  attachment: string | null;
  attachment_url: string | null;
  status: string;
  status_display: string;
  admin_note: string;
  created_at: string;
}

const STATUS = [
  { value: "new", label: "جدید" },
  { value: "in_progress", label: "در حال بررسی" },
  { value: "waiting", label: "در انتظار مشتری" },
  { value: "resolved", label: "حل شده" },
  { value: "closed", label: "بسته شده" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-zinc-200 text-zinc-600",
};

export default function RequestsAdmin() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<Paginated<ServiceRequest>>("/service-requests/", { auth: true })
      .then((d) => setItems(d.results))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const shown = filter ? items.filter((i) => i.status === filter) : items;

  return (
    <div>
      <h1 className="text-2xl font-black text-ink mb-1">درخواست‌های خدمات</h1>
      <p className="text-muted mb-6">مدیریت و بروزرسانی وضعیت درخواست‌ها</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip on={!filter} onClick={() => setFilter("")}>
          همه
        </Chip>
        {STATUS.map((s) => (
          <Chip key={s.value} on={filter === s.value} onClick={() => setFilter(s.value)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : shown.length === 0 ? (
        <p className="text-muted py-10 text-center">درخواستی یافت نشد.</p>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-3 font-bold hidden sm:table-cell">کد</th>
                <th className="text-right p-3 font-bold">نام</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">نوع</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">محصول</th>
                <th className="text-right p-3 font-bold">وضعیت</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-t border-line hover:bg-surface cursor-pointer"
                >
                  <td className="p-3 font-mono font-bold hidden sm:table-cell">{r.tracking_code}</td>
                  <td className="p-3">{r.full_name}</td>
                  <td className="p-3 hidden sm:table-cell">{r.request_type_display}</td>
                  <td className="p-3 hidden sm:table-cell">{r.product_name || "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[r.status]}`}>
                      {r.status_display}
                    </span>
                  </td>
                  <td className="p-3 text-muted hidden sm:table-cell">
                    {new Date(r.created_at).toLocaleDateString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <RequestDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
        on ? "bg-brand text-white" : "bg-white border border-line text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

function RequestDrawer({
  item,
  onClose,
  onSaved,
}: {
  item: ServiceRequest;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.admin_note || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/service-requests/${item.id}/`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status, admin_note: note }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-ink">جزئیات درخواست</h3>
          <button onClick={onClose} className="text-muted hover:text-brand">
            <X />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <Row label="کد پیگیری" value={item.tracking_code} />
          <Row label="نام" value={item.full_name} />
          <Row label="تماس" value={item.phone} />
          {item.email && <Row label="ایمیل" value={item.email} />}
          <Row label="نوع" value={item.request_type_display} />
          {item.product_name && <Row label="محصول" value={item.product_name} />}
          {item.serial_number && <Row label="سریال" value={item.serial_number} />}
          <div>
            <div className="text-muted mb-1">شرح</div>
            <p className="bg-surface rounded-xl p-4 leading-7 text-ink-soft">
              {item.description}
            </p>
          </div>
          {item.attachment_url && (
            <div className="flex items-center gap-3 bg-surface rounded-xl p-4">
              <span className="text-muted text-sm">پیوست:</span>
              <a
                href={item.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold text-sm underline underline-offset-2"
              >
                دانلود / مشاهده فایل پیوست
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-line pt-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">
              وضعیت
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">
              یادداشت ادمین
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="btn btn-primary w-full justify-center"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} /> ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-ink text-left">{value}</span>
    </div>
  );
}
