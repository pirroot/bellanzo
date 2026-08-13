"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Save, ImageIcon, Layout, Trash2, Lock } from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api";

interface Settings {
  brand_name: string; slogan: string; logo: string | null; about: string;
  phone: string; email: string; address: string;
  instagram: string; telegram: string; whatsapp: string; linkedin: string;
  hero_badge: string; hero_title_line1: string; hero_title_line2: string;
  hero_subtitle: string; hero_bg_image: string | null; hero_product_image: string | null;
  maintenance_mode: boolean;
}

const field = "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm";

function imgSrc(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE.replace("/api", "")}${path}`;
}

function ImageUpload({ label, preview, onChange, onClear }: {
  label: string;
  preview: string | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-ink-soft mb-2">{label}</label>
      <label className="cursor-pointer block w-full max-w-xs">
        <div className={`rounded-2xl border-2 border-dashed border-line overflow-hidden flex items-center justify-center bg-surface hover:border-brand transition-colors ${preview ? "h-32" : "h-20"}`}>
          {preview ? (
            <Image src={preview} alt={label} width={300} height={128} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="text-center text-muted py-3">
              <ImageIcon size={22} className="mx-auto mb-1" />
              <p className="text-xs">انتخاب عکس</p>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} className="hidden" />
      </label>
      {preview && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 flex items-center gap-1 text-xs text-brand hover:underline"
        >
          <Trash2 size={12} /> حذف تصویر
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Settings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [clearBg, setClearBg] = useState(false);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [clearProduct, setClearProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Settings>("/settings/", { auth: true })
      .then((data) => {
        setForm(data);
        setLogoPreview(imgSrc(data.logo));
        setBgPreview(imgSrc(data.hero_bg_image));
        setProductPreview(imgSrc(data.hero_product_image));
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true); setMsg(""); setError("");
    try {
      const fd = new FormData();
      const textKeys: (keyof Settings)[] = [
        "brand_name", "slogan", "about", "phone", "email", "address",
        "instagram", "telegram", "whatsapp", "linkedin",
        "hero_badge", "hero_title_line1", "hero_title_line2", "hero_subtitle",
      ];
      fd.append("maintenance_mode", String(form.maintenance_mode === true));
      for (const k of textKeys) if (form[k] !== undefined) fd.append(k, String(form[k]));
      if (logoFile) fd.append("logo", logoFile);
      else if (clearLogo) fd.append("clear_logo", "true");
      if (bgFile) fd.append("hero_bg_image", bgFile);
      else if (clearBg) fd.append("clear_hero_bg_image", "true");
      if (productFile) fd.append("hero_product_image", productFile);
      else if (clearProduct) fd.append("clear_hero_product_image", "true");
      await apiFetch("/settings/", { method: "PATCH", body: fd, auth: true });
      setMsg("تنظیمات با موفقیت ذخیره شد.");
      setClearLogo(false); setClearBg(false); setClearProduct(false);
      setLogoFile(null); setBgFile(null); setProductFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" /></div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink mb-1">تنظیمات سایت</h1>
        <p className="text-muted">مدیریت اطلاعات برند، تماس و صفحه اصلی</p>
      </div>

      {/* ── Hero Section ── */}
      <div className="bg-white rounded-3xl border border-line p-7 flex flex-col gap-6">
        <h2 className="font-black text-ink flex items-center gap-2">
          <Layout size={18} className="text-brand" /> تنظیمات صفحه اصلی (Hero)
        </h2>

        <ImageUpload
          label="عکس بک‌گراند (اختیاری — اگر خالی باشد، پترن چهارخانه نمایش داده می‌شود)"
          preview={bgPreview}
          onChange={(f) => { setBgFile(f); setBgPreview(URL.createObjectURL(f)); setClearBg(false); }}
          onClear={() => { setBgFile(null); setBgPreview(null); setClearBg(true); }}
        />

        <ImageUpload
          label="عکس محصول (سمت راست هیرو — اگر خالی باشد، تصویر پیش‌فرض نمایش داده می‌شود)"
          preview={productPreview}
          onChange={(f) => { setProductFile(f); setProductPreview(URL.createObjectURL(f)); setClearProduct(false); }}
          onClear={() => { setProductFile(null); setProductPreview(null); setClearProduct(true); }}
        />

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">متن بج (نوشته کوچک بالای عنوان)</label>
          <input value={form.hero_badge || ""} onChange={(e) => set("hero_badge", e.target.value)} className={field} placeholder="مثال: برند مورد اعتماد شما" />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">عنوان — خط اول (رنگ معمولی)</label>
          <input value={form.hero_title_line1 || ""} onChange={(e) => set("hero_title_line1", e.target.value)} className={field} placeholder="مثال: تجربه‌ای نو از" />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">عنوان — خط دوم (رنگ قرمز)</label>
          <input value={form.hero_title_line2 || ""} onChange={(e) => set("hero_title_line2", e.target.value)} className={field} placeholder="مثال: کیفیت و خدمات" />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">متن توضیح زیر عنوان</label>
          <textarea value={form.hero_subtitle || ""} onChange={(e) => set("hero_subtitle", e.target.value)} rows={3} className={field} />
        </div>
      </div>

      {/* ── Brand & Contact ── */}
      <div className="bg-white rounded-3xl border border-line p-7 flex flex-col gap-6">
        <h2 className="font-black text-ink">اطلاعات برند</h2>

        <ImageUpload
          label="لوگو سایت"
          preview={logoPreview}
          onChange={(f) => { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); setClearLogo(false); }}
          onClear={() => { setLogoFile(null); setLogoPreview(null); setClearLogo(true); }}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">نام برند</label>
            <input value={form.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className={field} />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">شعار</label>
            <input value={form.slogan || ""} onChange={(e) => set("slogan", e.target.value)} className={field} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">درباره ما</label>
          <textarea value={form.about || ""} onChange={(e) => set("about", e.target.value)} rows={4} className={field} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">تلفن</label>
            <input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} dir="ltr" className={field} />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">ایمیل</label>
            <input value={form.email || ""} onChange={(e) => set("email", e.target.value)} dir="ltr" className={field} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">آدرس</label>
          <input value={form.address || ""} onChange={(e) => set("address", e.target.value)} className={field} />
        </div>

        <div className="pt-2 border-t border-line">
          <p className="text-sm font-bold text-ink-soft mb-4">شبکه‌های اجتماعی</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {(["instagram", "telegram", "whatsapp", "linkedin"] as const).map((k) => (
              <div key={k}>
                <label className="block text-xs font-bold text-muted mb-1">{k}</label>
                <input value={form[k] || ""} onChange={(e) => set(k, e.target.value)} dir="ltr" className={field} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Maintenance Mode ── */}
      <div className={`rounded-3xl border-2 p-6 flex items-start justify-between gap-4 transition-colors ${form.maintenance_mode ? "border-brand bg-red-50" : "border-line bg-white"}`}>
        <div className="flex items-start gap-3">
          <Lock size={20} className={`mt-0.5 shrink-0 ${form.maintenance_mode ? "text-brand" : "text-muted"}`} />
          <div>
            <p className="font-black text-ink">حالت تعمیرگاه (قفل سایت)</p>
            <p className="text-sm text-muted mt-1">
              {form.maintenance_mode
                ? "⚠️ سایت قفل است — فقط صفحه «خدمات پس از فروش» قابل دسترس می‌باشد."
                : "سایت باز است — همه صفحات در دسترس کاربران هستند."}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <span className="text-sm font-bold text-muted">{form.maintenance_mode ? "فعال" : "غیرفعال"}</span>
          <div
            onClick={() => setForm((f) => ({ ...f, maintenance_mode: !f.maintenance_mode }))}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.maintenance_mode ? "bg-brand" : "bg-zinc-300"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.maintenance_mode ? "right-1" : "left-1"}`} />
          </div>
        </label>
      </div>

      {msg && <p className="text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm">{msg}</p>}
      {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

      <button onClick={save} disabled={saving} className="btn btn-primary w-full justify-center">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> ذخیره تمام تنظیمات</>}
      </button>
    </div>
  );
}
