'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ImageIcon, Trash2, Layout, Plus } from 'lucide-react';
import { apiFetch, API_BASE } from '@/lib/api';

interface PageHeader {
  page: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string | null;
  imageFile?: File | null;
}

const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm';

const pageOptions = [
  { value: 'products', label: 'محصولات' },
  { value: 'services', label: 'خدمات' },
  { value: 'contact', label: 'تماس با ما' },
  { value: 'blog', label: 'وبلاگ' },
  { value: 'spare-parts', label: 'قطعات یدکی' },
  { value: 'agencies', label: 'نمایندگی‌ها' },
];

function imgSrc(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace('/api', '')}${path}`;
}

function ImageUpload({
  label,
  preview,
  onChange,
  onClear,
}: {
  label: string;
  preview: string | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-ink-soft mb-2">{label}</label>
      <label className="cursor-pointer block w-full max-w-xs">
        <div
          className={`rounded-2xl border-2 border-dashed border-line overflow-hidden flex items-center justify-center bg-surface hover:border-brand transition-colors ${preview ? 'h-32' : 'h-20'}`}
        >
          {preview ? (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-muted py-3">
              <ImageIcon size={22} className="mx-auto mb-1" />
              <p className="text-xs">انتخاب عکس</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
          className="hidden"
        />
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

export default function PageHeadersAdmin() {
  const router = useRouter();
  const [headers, setHeaders] = useState<PageHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadHeaders();
  }, []);

  const loadHeaders = async () => {
    try {
      setLoading(true);
      const settings = await apiFetch<any>('/settings/', { auth: true });
      const pageHeaders = settings?.page_headers || {};

      const list = Object.entries(pageHeaders).map(([page, data]: [string, any]) => ({
        page,
        title: data.title || '',
        subtitle: data.subtitle || '',
        badge: data.badge || '',
        image: data.image || null,
        imageFile: null,
      }));

      setHeaders(list);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err.message || 'خطا در بارگذاری');
    } finally {
      setLoading(false);
    }
  };

  const saveHeaders = async () => {
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const pageHeaders: Record<string, any> = {};

      for (const h of headers) {
        let imageValue = h.image;

        // اگر تصویر جدید آپلود شده بود
        if (h.imageFile) {
          const formData = new FormData();
          formData.append('image', h.imageFile);

          const uploadRes = await apiFetch<any>('/upload/page-header/', {
            method: 'POST',
            body: formData,
            auth: true,
          });

          imageValue = uploadRes.url;
        }

        pageHeaders[h.page] = {
          title: h.title,
          subtitle: h.subtitle,
          badge: h.badge,
          image: imageValue,
        };
      }

      await apiFetch('/settings/', {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ page_headers: pageHeaders }),
      });

      setMsg('✅ تنظیمات با موفقیت ذخیره شد.');
      await loadHeaders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const addHeader = () => {
    const existingPages = headers.map((h) => h.page);
    const available = pageOptions.find((p) => !existingPages.includes(p.value));
    if (!available) {
      setError('همه صفحات قبلاً اضافه شده‌اند.');
      return;
    }
    setHeaders([
      ...headers,
      { page: available.value, title: '', subtitle: '', badge: '', image: null, imageFile: null },
    ]);
  };

  const removeHeader = (page: string) => {
    if (!confirm(`آیا از حذف تنظیمات صفحه "${page}" اطمینان دارید؟`)) return;
    setHeaders(headers.filter((h) => h.page !== page));
  };

  const updateHeader = (page: string, field: keyof PageHeader, value: string | File | null) => {
    setHeaders(
      headers.map((h) => {
        if (h.page === page) {
          if (field === 'image' && value instanceof File) {
            return { ...h, imageFile: value, image: URL.createObjectURL(value) };
          }
          return { ...h, [field]: value };
        }
        return h;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">سربرگ صفحات</h1>
          <p className="text-muted text-sm">مدیریت عنوان، زیرنویس، بج و تصویر سربرگ هر صفحه</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addHeader} className="btn btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> افزودن صفحه
          </button>
          <button
            onClick={saveHeaders}
            disabled={saving}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            ذخیره همه
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">{error}</div>}
      {msg && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm mb-4">{msg}</div>}

      {headers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <Layout size={64} className="mx-auto text-line mb-4" />
          <p className="text-muted">هیچ صفحه‌ای تنظیم نشده است.</p>
          <button onClick={addHeader} className="btn btn-primary mt-4 text-sm">
            افزودن صفحه جدید
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {headers.map((header) => (
            <div key={header.page} className="bg-white rounded-3xl border border-line p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg">
                    {pageOptions.find((p) => p.value === header.page)?.label || header.page}
                  </span>
                  <span className="text-xs text-muted bg-surface px-3 py-1 rounded-full">
                    ({header.page})
                  </span>
                </div>
                <button
                  onClick={() => removeHeader(header.page)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-soft mb-1">عنوان</label>
                  <input
                    value={header.title}
                    onChange={(e) => updateHeader(header.page, 'title', e.target.value)}
                    className={field}
                    placeholder="عنوان صفحه"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-soft mb-1">زیرنویس</label>
                  <input
                    value={header.subtitle}
                    onChange={(e) => updateHeader(header.page, 'subtitle', e.target.value)}
                    className={field}
                    placeholder="زیرنویس صفحه"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-bold text-ink-soft mb-1">
                  بج (متن کنار خط قرمز)
                </label>
                <input
                  value={header.badge}
                  onChange={(e) => updateHeader(header.page, 'badge', e.target.value)}
                  className={field}
                  placeholder="مثال: بلانزو"
                />
              </div>

              <div className="mt-3">
                <ImageUpload
                  label="تصویر پس‌زمینه"
                  preview={header.image ? imgSrc(header.image) : null}
                  onChange={(f) => updateHeader(header.page, 'image', f)}
                  onClear={() => updateHeader(header.page, 'image', null)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
