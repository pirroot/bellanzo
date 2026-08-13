"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ClipboardList, Package } from "lucide-react";
import { apiFetch } from "@/lib/api";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors";
const select = field + " appearance-none";

const RATING_OPTIONS = [
  { value: "", label: "انتخاب کنید" },
  { value: "excellent", label: "عالی" },
  { value: "good", label: "خوب" },
  { value: "average", label: "متوسط" },
  { value: "poor", label: "ضعیف" },
];

function RatingSelect({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-bold text-ink-soft mb-2">
        {label}{required && <span className="text-brand mr-1">*</span>}
      </label>
      <select name={name} className={select} required={required}>
        {RATING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center bg-white rounded-3xl border border-line p-10"
    >
      <span className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand mb-5">
        <CheckCircle2 size={34} />
      </span>
      <h3 className="text-2xl font-black text-ink">سپاسگزاریم!</h3>
      <p className="mt-2 text-muted">نظر شما ثبت شد و در بهبود خدمات ما مؤثر خواهد بود.</p>
    </motion.div>
  );
}

function ServiceSurveyForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { survey_type: "service" };
    for (const [k, v] of fd.entries()) body[k] = v as string;
    try {
      await apiFetch("/surveys/", { method: "POST", body: JSON.stringify(body) });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-line p-7 md:p-9 grid gap-5">
      <h3 className="font-black text-lg text-ink border-b border-line pb-4">نظرسنجی خدمات</h3>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نام و نام خانوادگی <span className="text-brand">*</span></label>
          <input name="full_name" required className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شماره تماس <span className="text-brand">*</span></label>
          <input name="phone" required dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">آدرس ایمیل <span className="text-brand">*</span></label>
          <input name="email" type="email" required dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شهر</label>
          <input name="city" className={field} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">نام نمایندگی مورد نظر <span className="text-brand">*</span></label>
        <input name="agency_name" required className={field} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <RatingSelect name="service_quality" label="کیفیت خدمات ارائه شده" />
        <RatingSelect name="staff_behavior" label="نحوه برخورد پرسنل" />
        <RatingSelect name="service_duration" label="مدت زمان ارائه خدمات" />
        <RatingSelect name="staff_knowledge" label="ارزیابی شما از دانش فنی پرسنل" />
        <RatingSelect name="service_cost" label="ارزیابی شما از هزینه ارائه خدمات" />
        <RatingSelect name="info_method" label="نحوه اطلاع‌رسانی" />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">
          با سپاس از وقت گرانبهایتان، چنانچه پیشنهادی دارید بفرمایید:
        </label>
        <textarea name="comment" rows={3} className={field} />
      </div>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>
      )}

      <button disabled={loading} className="btn btn-primary justify-center">
        {loading ? <Loader2 size={18} className="animate-spin" /> : "ثبت نظرسنجی"}
      </button>
    </form>
  );
}

function ProductSurveyForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { survey_type: "product" };
    for (const [k, v] of fd.entries()) body[k] = v as string;
    try {
      await apiFetch("/surveys/", { method: "POST", body: JSON.stringify(body) });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-line p-7 md:p-9 grid gap-5">
      <h3 className="font-black text-lg text-ink border-b border-line pb-4">نظرسنجی محصول</h3>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نام و نام خانوادگی <span className="text-brand">*</span></label>
          <input name="full_name" required className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شماره تماس <span className="text-brand">*</span></label>
          <input name="phone" required dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">آدرس ایمیل</label>
          <input name="email" type="email" dir="ltr" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">شهر</label>
          <input name="city" className={field} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">کدملی</label>
          <input name="national_id" dir="ltr" className={field} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">
          آیا در ۶ ماه تا یک سال اخیر از محصولات بلانزو خریداری نموده‌اید؟
        </label>
        <select name="purchased_recently" className={select}>
          <option value="">انتخاب کنید</option>
          <option value="yes">بله</option>
          <option value="no">خیر</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">یکی از آیتم‌های زیر را انتخاب کنید</label>
        <select name="selected_item" className={select}>
          <option value="">انتخاب کنید</option>
          <option value="یخچال">یخچال</option>
          <option value="ماشین لباسشویی">ماشین لباسشویی</option>
          <option value="اجاق گاز">اجاق گاز</option>
          <option value="ظرفشویی">ماشین ظرفشویی</option>
          <option value="مایکروویو">مایکروویو</option>
          <option value="جاروبرقی">جاروبرقی</option>
          <option value="سایر">سایر</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">در آینده نزدیک (۶ ماه تا ۱ سال) قصد خرید چه محصولی را دارید؟</label>
        <input name="future_purchase" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">کدام محصول بلانزو را در منزل استفاده می‌کنید؟</label>
        <input name="current_product_usage" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">
          در صورت داشتن هر یک از محصولات لوازم خانگی برقی در منزل، مدل آن را بنویسید:
        </label>
        <input name="home_appliance_models" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">سه برند از لوازم خانگی که در ذهن شما نقش بسته است را نام ببرید:</label>
        <input name="top_brands" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">آیا محصول یا برند بلانزو را به دوستان یا آشنایان توصیه می‌کنید؟</label>
        <select name="recommend" className={select}>
          <option value="">انتخاب کنید</option>
          <option value="yes">بله</option>
          <option value="no">خیر</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">به نظر شما کدام برند لوازم خانگی «ایرانی» موفق‌ترین است؟</label>
        <input name="best_iranian_brand" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">برای تکمیل شدن سبد محصولات بلانزو چه محصولی را پیشنهاد می‌کنید:</label>
        <input name="product_suggestion" className={field} />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink-soft mb-2">
          با سپاس از وقت گرانبهایتان، چنانچه پیشنهادی دارید بفرمایید:
        </label>
        <textarea name="comment" rows={3} className={field} />
      </div>

      {/* انتقادات و پیشنهادات */}
      <div className="border-t border-line pt-5 mt-2">
        <p className="font-black text-ink mb-4">انتقادات و پیشنهادات</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">مدل کالا</label>
            <input name="product_model" className={field} />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">تاریخ خرید</label>
            <input name="purchase_date_survey" type="date" dir="ltr" className={field} />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">شماره سریال</label>
            <input name="serial_number_survey" dir="ltr" className={field} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-bold text-ink-soft mb-2">
            متن انتقاد و پیشنهادات <span className="text-brand">*</span>
          </label>
          <textarea name="feedback_message" required rows={5} className={field} />
        </div>
      </div>

      {error && (
        <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>
      )}

      <button disabled={loading} className="btn btn-primary justify-center">
        {loading ? <Loader2 size={18} className="animate-spin" /> : "ثبت نظرسنجی"}
      </button>
    </form>
  );
}

export default function SurveyForm() {
  const [type, setType] = useState<"service" | "product">("service");
  const [done, setDone] = useState(false);

  if (done) return <SuccessCard />;

  return (
    <div className="grid gap-6">
      {/* Type switcher */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setType("service")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            type === "service"
              ? "bg-brand text-white shadow-[0_8px_24px_-8px_rgba(225,29,42,.5)]"
              : "bg-white border border-line text-ink-soft hover:border-brand"
          }`}
        >
          <ClipboardList size={18} />
          نظرسنجی خدمات
        </button>
        <button
          onClick={() => setType("product")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            type === "product"
              ? "bg-brand text-white shadow-[0_8px_24px_-8px_rgba(225,29,42,.5)]"
              : "bg-white border border-line text-ink-soft hover:border-brand"
          }`}
        >
          <Package size={18} />
          نظرسنجی محصول
        </button>
      </div>

      {type === "service" ? (
        <ServiceSurveyForm onDone={() => setDone(true)} />
      ) : (
        <ProductSurveyForm onDone={() => setDone(true)} />
      )}
    </div>
  );
}
