'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, Save, Delete, DeleteIcon, ExternalLinkIcon, LucideDelete, Trash2Icon, Square, PenIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import { Square_Peg } from 'next/font/google';

interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
}

const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm';

export default function FaqAdmin() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Faq | null>(null);
  const [isNew, setIsNew] = useState(false);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Faq>('/faqs/', { auth: true });
      // Handle both array and paginated response
      const faqsList = Array.isArray(data) ? data : data?.results || [];
      setFaqs(faqsList);
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

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این سوال اطمینان دارید؟')) return;
    try {
      await apiFetch(`/faqs/${id}/`, { method: 'DELETE', auth: true });
      await loadFaqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در حذف');
    }
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
          <h1 className="text-2xl font-black text-ink">سوالات متداول</h1>
          <p className="text-muted text-sm">مدیریت سوالات متداول</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: 0,
              question: '',
              answer: '',
              order: faqs.length + 1,
              is_active: true,
            });
            setIsNew(true);
          }}
          className="btn btn-primary text-sm"
        >
          <Plus size={18} /> افزودن سوال جدید
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">{error}</div>}
      {faqs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-muted">هیچ سوالی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-4 font-bold">#</th>
                <th className="text-right p-4 font-bold">سوال</th>
                <th className="text-right p-4 font-bold hidden sm:table-cell">ترتیب</th>
                <th className="text-right p-4 font-bold">وضعیت</th>
                <th className="text-right p-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="border-t border-line hover:bg-surface transition-colors"
                >
                  <td className="p-4 font-bold text-ink">#{faq.id}</td>
                  <td className="p-4 font-medium">{faq.question}</td>
                  <td className="p-4 text-muted hidden sm:table-cell">{faq.order}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        faq.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {faq.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => {
                          setEditing(faq);
                          setIsNew(false);
                        }}
                        className="text-brand hover:underline text-sm font-bold"
                      >
                        <PenIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        <Trash2Icon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {(editing || isNew) && (
        <FaqDrawer
          faq={editing}
          isNew={isNew}
          onClose={() => {
            setEditing(null);
            setIsNew(false);
          }}
          onSaved={() => {
            setEditing(null);
            setIsNew(false);
            loadFaqs();
          }}
        />
      )}
    </div>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────

function FaqDrawer({
  faq,
  isNew,
  onClose,
  onSaved,
}: {
  faq: Faq | null;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    order: faq?.order || 0,
    is_active: faq?.is_active !== undefined ? faq.is_active : true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setError('سوال و پاسخ الزامی هستند');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await apiFetch('/faqs/', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch(`/faqs/${faq?.id}/`, {
          method: 'PATCH',
          auth: true,
          body: JSON.stringify(form),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-lg bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-ink">{isNew ? 'سوال جدید' : 'ویرایش سوال'}</h3>
          <button onClick={onClose} className="text-muted hover:text-brand">
            <X />
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">سوال *</label>
          <input
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className={field}
            placeholder="سوال را وارد کنید"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">پاسخ *</label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={4}
            className={field}
            placeholder="پاسخ را وارد کنید"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">ترتیب</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className={field}
            dir="ltr"
          />
        </div>

        <label
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${
            form.is_active ? 'border-green-400 bg-green-50' : 'border-line bg-surface'
          }`}
        >
          <div>
            <p className="font-bold text-ink text-sm">✓ فعال</p>
            <p className="text-xs text-muted">سوال در سایت نمایش داده می‌شود</p>
          </div>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-5 h-5 accent-brand shrink-0"
          />
        </label>

        {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full justify-center"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isNew ? 'افزودن' : 'ذخیره تغییرات'}
        </button>
      </div>
    </div>
  );
}
