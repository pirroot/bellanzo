'use client';

import { API_BASE, apiFetch } from '@/lib/api';
import { ImageIcon, Loader2, Package, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface CategorySubItem {
  name: string;
  link: string;
}
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
  is_active: boolean;
  image?: string | null;
  sub_items?: CategorySubItem[];
}
interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  image: string | null;
  category: number | null;
  category_name: string;
  is_featured: boolean;
  is_active: boolean;
  features: string[];
  price: number;
  is_purchasable: boolean;
  stock: number;
  discount_price: number;
}
const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm';

const EMPTY_PRODUCT: Partial<Product> = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  category: null,
  is_featured: false,
  is_active: true,
  features: [],
  price: 0,
  is_purchasable: false,
  stock: 0,
  discount_price: 0,
};
const EMPTY_CAT: Partial<Category> = {
  name: '',
  slug: '',
  description: '',
  order: 0,
  is_active: true,
  sub_items: [],
};

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^؀-ۿa-z0-9-]/g, '');
}

function imgSrc(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace('/api', '')}${path}`;
}

export default function ProductsAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Partial<Category> | null>(null);
  const [isNewCat, setIsNewCat] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setSelectedIds(new Set());
    try {
      const [p, c] = await Promise.all([
        apiFetch<{ results: Product[] }>('/products/?ordering=-created_at', { auth: true }),
        apiFetch<Category[]>('/categories/', { auth: true }),
      ]);
      setProducts(p.results ?? []);
      setCats(Array.isArray(c) ? c : []);
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 401) {
        router.push('/admin/login');
        return;
      }
      setLoadError(e.message || 'خطا در بارگذاری');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const currentList = tab === 'products' ? products : cats;
  const allSelected = currentList.length > 0 && selectedIds.size === currentList.length;
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentList.map((i) => i.id)));
    }
  }
  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (!confirm(`آیا از حذف ${selectedIds.size} مورد مطمئن هستید؟`)) return;
    setBulkDeleting(true);
    try {
      const endpoint = tab === 'products' ? 'products' : 'categories';
      const items = tab === 'products' ? products : cats;
      await Promise.all(
        items
          .filter((i) => selectedIds.has(i.id))
          .map((i) => apiFetch(`/${endpoint}/${i.slug}/`, { method: 'DELETE', auth: true }))
      );
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در حذف');
      setBulkDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink mb-1">محصولات و دسته‌بندی‌ها</h1>
          <p className="text-muted">مدیریت کاتالوگ محصولات بلانزو</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {someSelected && (
            <button
              onClick={bulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
            >
              {bulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              حذف {selectedIds.size} مورد
            </button>
          )}
          <button
            onClick={() =>
              tab === 'products'
                ? (setSelectedProduct({ ...EMPTY_PRODUCT }), setIsNewProduct(true))
                : (setSelectedCat({ ...EMPTY_CAT }), setIsNewCat(true))
            }
            className="btn btn-primary text-sm"
          >
            <Plus size={18} /> {tab === 'products' ? 'افزودن محصول' : 'افزودن دسته‌بندی'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab('products');
            setSelectedIds(new Set());
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'products' ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}
        >
          <Package size={16} /> محصولات ({products.length})
        </button>
        <button
          onClick={() => {
            setTab('categories');
            setSelectedIds(new Set());
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'categories' ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}
        >
          <Tag size={16} /> دسته‌بندی‌ها ({cats.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : loadError ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-brand mb-4">{loadError}</p>
          <button onClick={load} className="btn btn-primary text-sm">
            تلاش مجدد
          </button>
        </div>
      ) : tab === 'products' ? (
        products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-line">
            <p className="text-muted mb-4">هنوز محصولی ثبت نشده است.</p>
            <button
              onClick={() => {
                setSelectedProduct({ ...EMPTY_PRODUCT });
                setIsNewProduct(true);
              }}
              className="btn btn-primary text-sm"
            >
              <Plus size={18} /> اولین محصول را اضافه کنید
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-brand cursor-pointer"
                    />
                  </th>
                  <th className="text-right p-3 font-bold hidden sm:table-cell">تصویر</th>
                  <th className="text-right p-3 font-bold">نام</th>
                  <th className="text-right p-3 font-bold hidden sm:table-cell">دسته‌بندی</th>
                  <th className="text-right p-3 font-bold">قیمت</th>
                  <th className="text-right p-3 font-bold hidden sm:table-cell">موجودی</th>
                  <th className="text-right p-3 font-bold">وضعیت</th>
                  <th className="text-right p-3 font-bold hidden sm:table-cell">ویژه</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const src = imgSrc(p.image);
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-line hover:bg-surface cursor-pointer ${selectedIds.has(p.id) ? 'bg-brand-soft' : ''}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleOne(p.id);
                          }}
                          className="w-4 h-4 accent-brand cursor-pointer"
                        />
                      </td>
                      <td
                        className="p-3 hidden sm:table-cell"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-line grid place-items-center">
                          {src ? (
                            <Image
                              src={src}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <ImageIcon size={18} className="text-muted" />
                          )}
                        </div>
                      </td>
                      <td
                        className="p-3 font-bold text-ink"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        {p.name}
                      </td>
                      <td
                        className="p-3 text-muted hidden sm:table-cell"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        {p.category_name || '—'}
                      </td>
                      <td
                        className="p-3 font-bold"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        {p.discount_price > 0 ? (
                          <div>
                            <span className="text-xs line-through text-muted">
                              {p.price.toLocaleString()}
                            </span>
                            <span className="text-brand block">
                              {p.discount_price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span>{p.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td
                        className="p-3 hidden sm:table-cell"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        {p.stock}
                      </td>
                      <td
                        className="p-3"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}
                        >
                          {p.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td
                        className="p-3 hidden sm:table-cell"
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsNewProduct(false);
                        }}
                      >
                        {p.is_featured ? '⭐' : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : cats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-muted mb-4">هنوز دسته‌بندی ثبت نشده است.</p>
          <button
            onClick={() => {
              setSelectedCat({ ...EMPTY_CAT });
              setIsNewCat(true);
            }}
            className="btn btn-primary text-sm"
          >
            <Plus size={18} /> اولین دسته‌بندی را اضافه کنید
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-brand cursor-pointer"
                  />
                </th>
                <th className="text-right p-3 font-bold">نام</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">اسلاگ</th>
                <th className="text-right p-3 font-bold hidden sm:table-cell">ترتیب</th>
                <th className="text-right p-3 font-bold">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-line hover:bg-surface cursor-pointer ${selectedIds.has(c.id) ? 'bg-brand-soft' : ''}`}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOne(c.id);
                      }}
                      className="w-4 h-4 accent-brand cursor-pointer"
                    />
                  </td>
                  <td
                    className="p-3 font-bold text-ink"
                    onClick={() => {
                      setSelectedCat({ ...c });
                      setIsNewCat(false);
                    }}
                  >
                    {c.name}
                  </td>
                  <td
                    className="p-3 text-muted hidden sm:table-cell"
                    dir="ltr"
                    onClick={() => {
                      setSelectedCat({ ...c });
                      setIsNewCat(false);
                    }}
                  >
                    {c.slug}
                  </td>
                  <td
                    className="p-3 text-muted hidden sm:table-cell"
                    onClick={() => {
                      setSelectedCat({ ...c });
                      setIsNewCat(false);
                    }}
                  >
                    {c.order}
                  </td>
                  <td
                    className="p-3"
                    onClick={() => {
                      setSelectedCat({ ...c });
                      setIsNewCat(false);
                    }}
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}
                    >
                      {c.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct !== null && (
        <ProductDrawer
          product={selectedProduct}
          isNew={isNewProduct}
          categories={cats}
          onClose={() => setSelectedProduct(null)}
          onSaved={() => {
            setSelectedProduct(null);
            load();
          }}
        />
      )}
      {selectedCat !== null && (
        <CategoryDrawer
          category={selectedCat}
          isNew={isNewCat}
          onClose={() => setSelectedCat(null)}
          onSaved={() => {
            setSelectedCat(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ─── Product Drawer ──────────────────────────────────────────────────────────

function ProductDrawer({
  product,
  isNew,
  categories,
  onClose,
  onSaved,
}: {
  product: Partial<Product>;
  isNew: boolean;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...product });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(imgSrc(product.image));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [featuresText, setFeaturesText] = useState(
    Array.isArray(product.features) ? product.features.join('\n') : ''
  );

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('slug', form.slug || slugify(form.name || ''));
      fd.append('short_description', form.short_description || '');
      fd.append('description', form.description || '');
      if (form.category) fd.append('category', String(form.category));
      fd.append('is_featured', String(!!form.is_featured));
      fd.append('is_active', String(form.is_active !== false));
      fd.append('price', String(form.price || 0));
      fd.append('is_purchasable', String(!!form.is_purchasable));
      fd.append('stock', String(form.stock || 0));
      fd.append('discount_price', String(form.discount_price || 0));
      fd.append(
        'features',
        JSON.stringify(
          featuresText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );
      if (imageFile) fd.append('image', imageFile);
      if (isNew) {
        await apiFetch('/products/', { method: 'POST', body: fd, auth: true });
      } else {
        await apiFetch(`/products/${form.id}/`, { method: 'PATCH', body: fd, auth: true });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await apiFetch(`/products/${form.id}/`, { method: 'DELETE', auth: true });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-lg bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-ink">{isNew ? 'محصول جدید' : 'ویرایش محصول'}</h3>
          <button onClick={onClose} className="text-muted hover:text-brand">
            <X />
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">تصویر محصول</label>
          <label className="cursor-pointer block">
            <div
              className={`rounded-2xl border-2 border-dashed border-line overflow-hidden flex items-center justify-center bg-surface ${imagePreview ? 'h-52' : 'h-36'} hover:border-brand transition-colors`}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={480}
                  height={208}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-center text-muted">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <p className="text-sm">کلیک کنید تا تصویر انتخاب شود</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
              }}
              className="mt-2 text-xs text-muted hover:text-brand"
            >
              حذف تصویر
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نام محصول *</label>
          <input
            value={form.name || ''}
            onChange={(e) => {
              set('name', e.target.value);
              set('slug', slugify(e.target.value));
            }}
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">اسلاگ (URL)</label>
          <input
            value={form.slug || ''}
            onChange={(e) => set('slug', e.target.value)}
            dir="ltr"
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">دسته‌بندی</label>
          <select
            value={form.category || ''}
            onChange={(e) => set('category', e.target.value ? Number(e.target.value) : null)}
            className={field}
          >
            <option value="">بدون دسته‌بندی</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">توضیح کوتاه</label>
          <input
            value={form.short_description || ''}
            onChange={(e) => set('short_description', e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">توضیحات کامل</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">
            ویژگی‌ها (هر خط یک ویژگی)
          </label>
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={4}
            placeholder="مثلاً:&#10;توان ۱۵۰۰ وات&#10;ظرفیت ۵ لیتر"
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">موجودی</label>
            <input
              type="number"
              value={form.stock || ''}
              onChange={(e) => set('stock', Number(e.target.value))}
              className={field}
              dir="ltr"
              placeholder="۰"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">قیمت تخفیف‌خورده</label>
            <input
              type="number"
              value={form.discount_price || ''}
              onChange={(e) => set('discount_price', Number(e.target.value))}
              className={field}
              dir="ltr"
              placeholder="۰ (بدون تخفیف)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">قیمت (ریال)</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              className={field}
              dir="ltr"
              placeholder="۰"
            />
          </div>
          <div className="flex items-end">
            <label
              className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-3 w-full cursor-pointer transition-colors ${form.is_purchasable ? 'border-green-400 bg-green-50' : 'border-line bg-surface'}`}
            >
              <div>
                <p className="font-bold text-ink text-sm">🛒 قابل خرید</p>
                <p className="text-xs text-muted">فعال‌سازی برای فروش</p>
              </div>
              <input
                type="checkbox"
                checked={!!form.is_purchasable}
                onChange={(e) => set('is_purchasable', e.target.checked)}
                className="w-5 h-5 accent-brand shrink-0"
              />
            </label>
          </div>
        </div>

        <label
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${form.is_featured ? 'border-amber-400 bg-amber-50' : 'border-line bg-surface'}`}
        >
          <div>
            <p className="font-bold text-ink text-sm">⭐ محصول ویژه</p>
            <p className="text-xs text-muted mt-0.5">
              در بخش محصولات ویژه صفحه اصلی نمایش داده می‌شود
            </p>
          </div>
          <input
            type="checkbox"
            checked={!!form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            className="w-5 h-5 accent-brand shrink-0"
          />
        </label>

        <label
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${form.is_active !== false ? 'border-green-400 bg-green-50' : 'border-line bg-surface'}`}
        >
          <div>
            <p className="font-bold text-ink text-sm">✓ محصول فعال</p>
            <p className="text-xs text-muted mt-0.5">محصول فعال در سایت نمایش داده می‌شود</p>
          </div>
          <input
            type="checkbox"
            checked={form.is_active !== false}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-5 h-5 accent-brand shrink-0"
          />
        </label>

        {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="btn btn-primary flex-1 justify-center"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} /> ذخیره
              </>
            )}
          </button>
          {!isNew && (
            <button
              onClick={remove}
              disabled={deleting}
              className="btn btn-outline text-brand border-brand justify-center px-4"
            >
              {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category Drawer ─────────────────────────────────────────────────────────

function CategoryDrawer({
  category,
  isNew,
  onClose,
  onSaved,
}: {
  category: Partial<Category>;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...category });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(imgSrc(category.image));
  const [subItems, setSubItems] = useState<CategorySubItem[]>(category.sub_items ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addSubItem() {
    setSubItems((p) => [...p, { name: '', link: '' }]);
  }
  function removeSubItem(i: number) {
    setSubItems((p) => p.filter((_, idx) => idx !== i));
  }
  function updateSubItem(i: number, k: 'name' | 'link', v: string) {
    setSubItems((p) => p.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('slug', form.slug || slugify(form.name || ''));
      fd.append('description', form.description || '');
      fd.append('order', String(form.order ?? 0));
      fd.append('is_active', String(form.is_active !== false));
      fd.append('sub_items', JSON.stringify(subItems.filter((s) => s.name)));
      if (imageFile) fd.append('image', imageFile);
      if (isNew) {
        await apiFetch('/categories/', { method: 'POST', body: fd, auth: true });
      } else {
        await apiFetch(`/categories/${form.slug}/`, { method: 'PATCH', body: fd, auth: true });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await apiFetch(`/categories/${form.slug}/`, { method: 'DELETE', auth: true });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-lg bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-ink">
            {isNew ? 'دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-brand">
            <X />
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">تصویر دسته‌بندی</label>
          <label className="cursor-pointer block">
            <div
              className={`rounded-2xl border-2 border-dashed border-line overflow-hidden flex items-center justify-center bg-surface ${imagePreview ? 'h-44' : 'h-28'} hover:border-brand transition-colors`}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={400}
                  height={176}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-muted">
                  <ImageIcon size={28} className="mx-auto mb-1" />
                  <p className="text-sm">کلیک کنید تا تصویر انتخاب شود</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
              }}
              className="mt-1 text-xs text-muted hover:text-brand"
            >
              حذف تصویر
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">نام دسته‌بندی *</label>
          <input
            value={form.name || ''}
            onChange={(e) => {
              set('name', e.target.value);
              set('slug', slugify(e.target.value));
            }}
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">اسلاگ (URL)</label>
          <input
            value={form.slug || ''}
            onChange={(e) => set('slug', e.target.value)}
            dir="ltr"
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">توضیحات</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className={field}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-soft mb-2">ترتیب نمایش</label>
          <input
            type="number"
            value={form.order ?? 0}
            onChange={(e) => set('order', Number(e.target.value))}
            dir="ltr"
            className={field}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-ink-soft">زیرمنوها (نمایش در hover)</label>
            <button
              type="button"
              onClick={addSubItem}
              className="flex items-center gap-1 text-xs text-brand font-bold hover:underline"
            >
              <Plus size={14} /> افزودن
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {subItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={item.name}
                  onChange={(e) => updateSubItem(i, 'name', e.target.value)}
                  placeholder="عنوان (مثل: سرخ‌کن)"
                  className={field + ' flex-1'}
                />
                <input
                  value={item.link}
                  onChange={(e) => updateSubItem(i, 'link', e.target.value)}
                  placeholder="لینک"
                  dir="ltr"
                  className={field + ' flex-1'}
                />
                <button
                  type="button"
                  onClick={() => removeSubItem(i)}
                  className="text-muted hover:text-brand shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {subItems.length === 0 && (
              <p className="text-xs text-muted">
                زیرمنویی تعریف نشده — در حالت hover فقط «مشاهده همه» نمایش داده می‌شود.
              </p>
            )}
          </div>
        </div>

        <label
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${form.is_active !== false ? 'border-green-400 bg-green-50' : 'border-line bg-surface'}`}
        >
          <div>
            <p className="font-bold text-ink text-sm">✓ دسته‌بندی فعال</p>
            <p className="text-xs text-muted mt-0.5">دسته‌بندی فعال در سایت نمایش داده می‌شود</p>
          </div>
          <input
            type="checkbox"
            checked={form.is_active !== false}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-5 h-5 accent-brand shrink-0"
          />
        </label>

        {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="btn btn-primary flex-1 justify-center"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} /> ذخیره
              </>
            )}
          </button>
          {!isNew && (
            <button
              onClick={remove}
              disabled={deleting}
              className="btn btn-outline text-brand border-brand justify-center px-4"
            >
              {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
