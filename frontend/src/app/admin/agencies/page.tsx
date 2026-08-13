"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Save, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const ALL_PROVINCES = [
  { id: "tehran", name: "تهران" }, { id: "alborz", name: "البرز" },
  { id: "isfahan", name: "اصفهان" }, { id: "fars", name: "فارس" },
  { id: "khorasan-razavi", name: "خراسان رضوی" }, { id: "azerbaijan-east", name: "آذربایجان شرقی" },
  { id: "azerbaijan-west", name: "آذربایجان غربی" }, { id: "khuzestan", name: "خوزستان" },
  { id: "mazandaran", name: "مازندران" }, { id: "gilan", name: "گیلان" },
  { id: "kermanshah", name: "کرمانشاه" }, { id: "golestan", name: "گلستان" },
  { id: "semnan", name: "سمنان" }, { id: "yazd", name: "یزد" },
  { id: "zanjan", name: "زنجان" }, { id: "qazvin", name: "قزوین" },
  { id: "qom", name: "قم" }, { id: "markazi", name: "مرکزی" },
  { id: "hamadan", name: "همدان" }, { id: "kurdistan", name: "کردستان" },
  { id: "lorestan", name: "لرستان" }, { id: "ilam", name: "ایلام" },
  { id: "chahar-mahaal-bakhtiari", name: "چهارمحال بختیاری" },
  { id: "kohgiluyeh-boyer-ahmad", name: "کهگیلویه و بویراحمد" },
  { id: "bushehr", name: "بوشهر" }, { id: "hormozgan", name: "هرمزگان" },
  { id: "sistan-baluchestan", name: "سیستان و بلوچستان" },
  { id: "ardabil", name: "اردبیل" }, { id: "khorasan-north", name: "خراسان شمالی" },
  { id: "khorasan-south", name: "خراسان جنوبی" }, { id: "kerman", name: "کرمان" },
];

interface Agency {
  id: number; province: string; province_display: string;
  city: string; name: string; address: string; phone: string; code: string;
  agency_type: "sales" | "service"; is_active: boolean;
}

const EMPTY: Partial<Agency> = { province: "", city: "", name: "", address: "", phone: "", code: "", agency_type: "sales", is_active: true };
const field = "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm";

export default function AgenciesAdmin() {
  const router = useRouter();
  const [items, setItems] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Partial<Agency> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterProv, setFilterProv] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch<Agency[]>("/agencies/", { auth: true });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) { router.push("/admin/login"); return; }
      setError(err.message);
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = filterProv ? items.filter((i) => i.province === filterProv) : items;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink mb-1">نمایندگی‌ها</h1>
          <p className="text-muted">مدیریت نمایندگان مجاز بلانزو در سراسر کشور</p>
        </div>
        <button onClick={() => { setSelected({ ...EMPTY }); setIsNew(true); }} className="btn btn-primary text-sm">
          <Plus size={18} /> افزودن نمایندگی
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterProv} onChange={(e) => setFilterProv(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
          <option value="">همه استان‌ها ({items.length})</option>
          {ALL_PROVINCES.map((p) => {
            const count = items.filter((i) => i.province === p.id).length;
            return count > 0 ? <option key={p.id} value={p.id}>{p.name} ({count})</option> : null;
          })}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" /></div>
      ) : error ? (
        <div className="text-center py-20 text-brand">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-muted mb-4">هنوز نمایندگی ثبت نشده است.</p>
          <button onClick={() => { setSelected({ ...EMPTY }); setIsNew(true); }} className="btn btn-primary text-sm">
            <Plus size={18} /> اولین نمایندگی را اضافه کنید
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-3 font-bold">نام نمایندگی</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">استان</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">شهر</th>
                <th className="text-right p-3 font-bold">نوع</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">تلفن</th>
                <th className="text-right p-3 font-bold">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ag) => (
                <tr key={ag.id} onClick={() => { setSelected({ ...ag }); setIsNew(false); }}
                  className="border-t border-line hover:bg-surface cursor-pointer">
                  <td className="p-3 font-bold text-ink">{ag.name}</td>
                  <td className="p-3 text-muted hidden sm:table-cell">{ag.province_display}</td>
                  <td className="p-3 text-muted hidden sm:table-cell">{ag.city}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ag.agency_type === "service" ? "bg-[#6c3483]/10 text-[#6c3483]" : "bg-[#1a5276]/10 text-[#1a5276]"}`}>
                      {ag.agency_type === "service" ? "خدمات" : "فروش"}
                    </span>
                  </td>
                  <td className="p-3 text-muted hidden sm:table-cell" dir="ltr">{ag.phone}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ag.is_active ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-500"}`}>
                      {ag.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected !== null && (
        <AgencyDrawer agency={selected} isNew={isNew}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); load(); }} />
      )}
    </div>
  );
}

function AgencyDrawer({ agency, isNew, onClose, onSaved }: {
  agency: Partial<Agency>; isNew: boolean;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...agency });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: unknown) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true); setError("");
    try {
      const body = { province: form.province, city: form.city, name: form.name, address: form.address, phone: form.phone, code: form.code || "", agency_type: form.agency_type || "sales", is_active: form.is_active !== false };
      if (isNew) {
        await apiFetch("/agencies/", { method: "POST", body: JSON.stringify(body), auth: true });
      } else {
        await apiFetch(`/agencies/${form.id}/`, { method: "PATCH", body: JSON.stringify(body), auth: true });
      }
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "خطا"); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm("حذف این نمایندگی؟")) return;
    setDeleting(true);
    try {
      await apiFetch(`/agencies/${form.id}/`, { method: "DELETE", auth: true });
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "خطا"); }
    finally { setDeleting(false); }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-ink">{isNew ? "نمایندگی جدید" : "ویرایش نمایندگی"}</h3>
          <button onClick={onClose} className="text-muted hover:text-brand"><X /></button>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">استان *</label>
          <select value={form.province || ""} onChange={(e) => set("province", e.target.value)} className={field}>
            <option value="">انتخاب استان...</option>
            {ALL_PROVINCES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شهر *</label>
          <input value={form.city || ""} onChange={(e) => set("city", e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نام نمایندگی *</label>
          <input value={form.name || ""} onChange={(e) => set("name", e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">آدرس *</label>
          <textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} rows={3} className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">تلفن *</label>
          <input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">کد نمایندگی</label>
          <input value={form.code || ""} onChange={(e) => set("code", e.target.value)} dir="ltr" className={field} />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نوع نمایندگی *</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${(form.agency_type ?? "sales") === "sales" ? "border-[#1a5276] bg-[#1a5276]/5" : "border-line bg-surface"}`}>
              <input type="radio" name="agency_type" value="sales" checked={(form.agency_type ?? "sales") === "sales"} onChange={() => set("agency_type", "sales")} className="accent-brand" />
              <div>
                <p className="font-bold text-ink text-sm">فروش</p>
                <p className="text-xs text-muted">نمایندگی فروش</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${form.agency_type === "service" ? "border-[#6c3483] bg-[#6c3483]/5" : "border-line bg-surface"}`}>
              <input type="radio" name="agency_type" value="service" checked={form.agency_type === "service"} onChange={() => set("agency_type", "service")} className="accent-brand" />
              <div>
                <p className="font-bold text-ink text-sm">خدمات</p>
                <p className="text-xs text-muted">نمایندگی خدمات</p>
              </div>
            </label>
          </div>
        </div>

        <label className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${form.is_active !== false ? "border-green-400 bg-green-50" : "border-line bg-surface"}`}>
          <div>
            <p className="font-bold text-ink text-sm">✓ نمایندگی فعال</p>
            <p className="text-xs text-muted mt-0.5">نمایندگی فعال در نقشه نمایش داده می‌شود</p>
          </div>
          <input type="checkbox" checked={form.is_active !== false} onChange={(e) => set("is_active", e.target.checked)} className="w-5 h-5 accent-brand shrink-0" />
        </label>

        {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="btn btn-primary flex-1 justify-center">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> ذخیره</>}
          </button>
          {!isNew && (
            <button onClick={remove} disabled={deleting} className="btn btn-outline text-brand border-brand justify-center px-4">
              {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
