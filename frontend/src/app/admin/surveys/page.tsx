"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, ClipboardList, Package } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/lib/types";

interface Survey {
  id: number;
  survey_type: "service" | "product";
  survey_type_display: string;
  full_name: string;
  phone: string;
  city: string;
  agency_name: string;
  service_quality: string;
  staff_behavior: string;
  service_duration: string;
  staff_knowledge: string;
  service_cost: string;
  info_method: string;
  comment: string;
  rating: number | null;
  created_at: string;
}

const RATING_LABEL: Record<string, string> = {
  excellent: "عالی",
  good: "خوب",
  average: "متوسط",
  poor: "ضعیف",
};

function RatingBadge({ value }: { value: string }) {
  if (!value) return <span className="text-muted">—</span>;
  const colors: Record<string, string> = {
    excellent: "bg-green-100 text-green-700",
    good: "bg-blue-100 text-blue-700",
    average: "bg-amber-100 text-amber-700",
    poor: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[value] || ""}`}>
      {RATING_LABEL[value] || value}
    </span>
  );
}

export default function SurveysAdmin() {
  const [items, setItems] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"" | "service" | "product">("");
  const [selected, setSelected] = useState<Survey | null>(null);

  useEffect(() => {
    apiFetch<Paginated<Survey>>("/surveys/", { auth: true })
      .then((d) => setItems(d.results))
      .finally(() => setLoading(false));
  }, []);

  const shown = typeFilter ? items.filter((i) => i.survey_type === typeFilter) : items;

  return (
    <div>
      <h1 className="text-2xl font-black text-ink mb-1">نظرسنجی‌ها</h1>
      <p className="text-muted mb-6">بازخوردهای ثبت‌شده توسط مشتریان</p>

      <div className="flex gap-2 mb-6">
        {[
          { value: "", label: "همه" },
          { value: "service", label: "نظرسنجی خدمات" },
          { value: "product", label: "نظرسنجی محصول" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value as typeof typeFilter)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              typeFilter === f.value
                ? "bg-brand text-white"
                : "bg-white border border-line text-ink-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : shown.length === 0 ? (
        <p className="text-muted py-10 text-center">نظری ثبت نشده است.</p>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-3 font-bold hidden sm:table-cell">نوع</th>
                <th className="text-right p-3 font-bold">نام</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">شهر</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">کیفیت خدمات</th>
                <th className="text-right p-3 font-bold">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="border-t border-line hover:bg-surface cursor-pointer"
                >
                  <td className="p-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                      {s.survey_type === "service" ? (
                        <><ClipboardList size={14} /> خدمات</>
                      ) : (
                        <><Package size={14} /> محصول</>
                      )}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-ink">{s.full_name || "ناشناس"}</td>
                  <td className="p-3 text-muted hidden sm:table-cell">{s.city || "—"}</td>
                  <td className="p-3 hidden sm:table-cell">
                    {s.survey_type === "service" ? (
                      <RatingBadge value={s.service_quality} />
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-muted">
                    {new Date(s.created_at).toLocaleDateString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <SurveyDrawer item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function SurveyDrawer({ item, onClose }: { item: Survey; onClose: () => void }) {
  const isService = item.survey_type === "service";

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-ink">
            {isService ? "نظرسنجی خدمات" : "نظرسنجی محصول"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-brand">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="نام" value={item.full_name || "—"} />
          <Row label="تماس" value={item.phone || "—"} />
          <Row label="شهر" value={item.city || "—"} />
          {isService && (
            <>
              <Row label="نمایندگی" value={item.agency_name || "—"} />
              <div className="border-t border-line pt-3 mt-3">
                <p className="font-bold text-ink mb-3">ارزیابی‌ها</p>
                {[
                  ["کیفیت خدمات", item.service_quality],
                  ["برخورد پرسنل", item.staff_behavior],
                  ["مدت زمان خدمات", item.service_duration],
                  ["دانش فنی پرسنل", item.staff_knowledge],
                  ["هزینه خدمات", item.service_cost],
                  ["اطلاع‌رسانی", item.info_method],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1.5">
                    <span className="text-muted">{label}</span>
                    <RatingBadge value={value} />
                  </div>
                ))}
              </div>
            </>
          )}
          {item.comment && (
            <div className="border-t border-line pt-3 mt-3">
              <p className="text-muted mb-1">پیشنهادات</p>
              <p className="bg-surface rounded-xl p-4 leading-7 text-ink-soft">
                {item.comment}
              </p>
            </div>
          )}
          <p className="text-xs text-muted pt-2">
            {new Date(item.created_at).toLocaleDateString("fa-IR")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}
