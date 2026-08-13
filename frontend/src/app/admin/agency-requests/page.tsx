"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store, Wrench, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SalesRequest {
  id: number; full_name: string; store_name: string; province: string; city: string;
  phone_landline: string; phone_mobile: string; ownership: "owner" | "tenant";
  experience_years: number; store_address: string; created_at: string; is_read: boolean;
}

interface ServiceRequest {
  id: number; full_name: string; workshop_name: string; province: string; city: string;
  education: string; technician_count: number; previous_brands: string; facilities: string;
  created_at: string; is_read: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

function Row({ label, value }: { label: string; value: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted shrink-0 w-44">{label}:</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}

function SalesCard({ req, onRead }: { req: SalesRequest; onRead: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border ${req.is_read ? "border-line" : "border-[#1a5276]/40 shadow-sm"} overflow-hidden`}>
      <button onClick={() => { setOpen(!open); if (!req.is_read) onRead(); }}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-surface transition-colors">
        {!req.is_read && <Circle size={8} className="text-[#1a5276] fill-[#1a5276] shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink text-sm">{req.full_name}</p>
          <p className="text-xs text-muted truncate">{req.store_name} — {req.city}، {req.province}</p>
        </div>
        <span className="text-xs text-muted shrink-0">{formatDate(req.created_at)}</span>
        {open ? <ChevronUp size={16} className="text-muted shrink-0" /> : <ChevronDown size={16} className="text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-line space-y-2.5">
          <Row label="نام فروشگاه / گالری" value={req.store_name} />
          <Row label="استان و شهر" value={`${req.province}، ${req.city}`} />
          <Row label="تلفن همراه" value={req.phone_mobile} />
          <Row label="تلفن ثابت" value={req.phone_landline} />
          <Row label="مالکیت فروشگاه" value={req.ownership === "owner" ? "مالک" : "مستأجر"} />
          <Row label="سابقه فعالیت" value={`${req.experience_years} سال`} />
          <Row label="آدرس فروشگاه" value={req.store_address} />
        </div>
      )}
    </div>
  );
}

function ServiceCard({ req, onRead }: { req: ServiceRequest; onRead: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border ${req.is_read ? "border-line" : "border-[#6c3483]/40 shadow-sm"} overflow-hidden`}>
      <button onClick={() => { setOpen(!open); if (!req.is_read) onRead(); }}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-surface transition-colors">
        {!req.is_read && <Circle size={8} className="text-[#6c3483] fill-[#6c3483] shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink text-sm">{req.full_name}</p>
          <p className="text-xs text-muted truncate">{req.workshop_name} — {req.city}، {req.province}</p>
        </div>
        <span className="text-xs text-muted shrink-0">{formatDate(req.created_at)}</span>
        {open ? <ChevronUp size={16} className="text-muted shrink-0" /> : <ChevronDown size={16} className="text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-line space-y-2.5">
          <Row label="نام تعمیرگاه / واحد خدماتی" value={req.workshop_name} />
          <Row label="استان و شهر" value={`${req.province}، ${req.city}`} />
          <Row label="مدرک فنی / تحصیلی" value={req.education} />
          <Row label="تعداد تکنسین" value={req.technician_count} />
          <Row label="سابقه همکاری با برندها" value={req.previous_brands} />
          <Row label="امکانات موجود" value={req.facilities} />
        </div>
      )}
    </div>
  );
}

export default function AgencyRequestsAdmin() {
  const router = useRouter();
  const [salesReqs, setSalesReqs] = useState<SalesRequest[]>([]);
  const [serviceReqs, setServiceReqs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"sales" | "service">("sales");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [sales, service] = await Promise.all([
        apiFetch<SalesRequest[]>("/agency-requests/sales/list/", { auth: true }),
        apiFetch<ServiceRequest[]>("/agency-requests/service/list/", { auth: true }),
      ]);
      setSalesReqs(Array.isArray(sales) ? sales : []);
      setServiceReqs(Array.isArray(service) ? service : []);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) { router.push("/admin/login"); return; }
      setError(err.message);
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function markSalesRead(id: number) {
    await apiFetch(`/agency-requests/sales/${id}/read/`, { method: "PATCH", auth: true }).catch(() => {});
    setSalesReqs(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
  }

  async function markServiceRead(id: number) {
    await apiFetch(`/agency-requests/service/${id}/read/`, { method: "PATCH", auth: true }).catch(() => {});
    setServiceReqs(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
  }

  const unreadSales = salesReqs.filter(r => !r.is_read).length;
  const unreadService = serviceReqs.filter(r => !r.is_read).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink mb-1">درخواست‌های نمایندگی</h1>
        <p className="text-muted">درخواست‌های اخذ نمایندگی فروش و خدمات</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab("sales")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${tab === "sales" ? "bg-[#1a5276] text-white border-[#1a5276]" : "bg-white text-ink border-line hover:border-[#1a5276]"}`}>
          <Store size={16} /> نمایندگی فروش
          {unreadSales > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${tab === "sales" ? "bg-white text-[#1a5276]" : "bg-[#1a5276] text-white"}`}>{unreadSales}</span>
          )}
        </button>
        <button onClick={() => setTab("service")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${tab === "service" ? "bg-[#6c3483] text-white border-[#6c3483]" : "bg-white text-ink border-line hover:border-[#6c3483]"}`}>
          <Wrench size={16} /> نمایندگی خدمات پس از فروش و گارانتی
          {unreadService > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${tab === "service" ? "bg-white text-[#6c3483]" : "bg-[#6c3483] text-white"}`}>{unreadService}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" /></div>
      ) : error ? (
        <div className="text-center py-20 text-brand">{error}</div>
      ) : tab === "sales" ? (
        salesReqs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-line">
            <Store size={40} className="mx-auto text-muted mb-3" />
            <p className="text-muted">هنوز درخواست نمایندگی فروشی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {salesReqs.map(req => (
              <SalesCard key={req.id} req={req} onRead={() => markSalesRead(req.id)} />
            ))}
          </div>
        )
      ) : (
        serviceReqs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-line">
            <Wrench size={40} className="mx-auto text-muted mb-3" />
            <p className="text-muted">هنوز درخواست نمایندگی خدماتی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceReqs.map(req => (
              <ServiceCard key={req.id} req={req} onRead={() => markServiceRead(req.id)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

