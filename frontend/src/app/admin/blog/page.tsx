'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Plus, X, Save, ImageIcon, Eye } from 'lucide-react';
import { apiFetch, mediaUrl } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  video_url: string;
  author: string;
  is_published: boolean;
  created_at: string;
}

const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand transition-colors text-sm';

export default function BlogAdmin() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/posts/', { auth: true });
      const list = Array.isArray(data) ? data : data?.results || [];
      setPosts(list);
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
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این پست اطمینان دارید؟')) return;
    try {
      await apiFetch(`/posts/${id}/`, { method: 'DELETE', auth: true });
      await loadPosts();
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
          <h1 className="text-2xl font-black text-ink">وبلاگ</h1>
          <p className="text-muted text-sm">مدیریت پست‌های وبلاگ</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              id: 0,
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              image: null,
              video_url: '',
              author: '',
              is_published: true,
              created_at: '',
            });
            setIsNew(true);
          }}
          className="btn btn-primary text-sm"
        >
          <Plus size={18} /> پست جدید
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">{error}</div>}

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-line">
          <p className="text-muted">هیچ پستی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="text-right p-4 font-bold">#</th>
                <th className="text-right p-4 font-bold">عنوان</th>
                <th className="text-right p-4 font-bold hidden sm:table-cell">نویسنده</th>
                <th className="text-right p-4 font-bold">وضعیت</th>
                <th className="text-right p-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-line hover:bg-surface transition-colors"
                >
                  <td className="p-4 font-bold text-ink">#{post.id}</td>
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4 text-muted hidden sm:table-cell">{post.author || 'بلانزو'}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}
                    >
                      {post.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/blog/${post.slug}`)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(post);
                          setIsNew(false);
                        }}
                        className="text-brand hover:underline text-sm font-bold"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || isNew) && (
        <PostDrawer
          post={editing}
          isNew={isNew}
          onClose={() => {
            setEditing(null);
            setIsNew(false);
          }}
          onSaved={() => {
            setEditing(null);
            setIsNew(false);
            loadPosts();
          }}
        />
      )}
    </div>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────

function PostDrawer({
  post,
  isNew,
  onClose,
  onSaved,
}: {
  post: Post | null;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    image: post?.image || null,
    video_url: post?.video_url || '',
    author: post?.author || 'بلانزو',
    is_published: post?.is_published !== undefined ? post.is_published : true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.image ? mediaUrl(post.image) : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('عنوان و محتوا الزامی هستند');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('slug', form.slug);
      fd.append('excerpt', form.excerpt);
      fd.append('content', form.content);
      fd.append('author', form.author);
      fd.append('is_published', String(form.is_published));
      fd.append('video_url', form.video_url || '');
      if (imageFile) fd.append('image', imageFile);

      if (isNew) {
        await apiFetch('/posts/', { method: 'POST', body: fd, auth: true });
      } else {
        await apiFetch(`/posts/${post?.id}/`, { method: 'PATCH', body: fd, auth: true });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-lg bg-white overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-ink">{isNew ? 'پست جدید' : 'ویرایش پست'}</h3>
          <button onClick={onClose} className="text-muted hover:text-brand">
            <X />
          </button>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-bold mb-2">تصویر شاخص</label>
          <label className="cursor-pointer block">
            <div
              className={`rounded-2xl border-2 border-dashed border-line overflow-hidden flex items-center justify-center bg-surface ${imagePreview ? 'h-40' : 'h-24'} hover:border-brand transition-colors`}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={400}
                  height={160}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-muted">
                  <ImageIcon size={28} className="mx-auto mb-1" />
                  <p className="text-sm">انتخاب تصویر</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setImageFile(f);
                  setImagePreview(URL.createObjectURL(f));
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={field}
          placeholder="عنوان *"
        />
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className={field}
          placeholder="اسلاگ"
          dir="ltr"
        />
        <input
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className={field}
          placeholder="خلاصه"
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={6}
          className={field}
          placeholder="محتوا (HTML قابل استفاده است) *"
        />
        <input
          value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          className={field}
          placeholder="لینک ویدیو (YouTube)"
          dir="ltr"
        />
        <input
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className={field}
          placeholder="نویسنده"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="w-5 h-5 accent-brand"
          />
          <span className="text-sm font-bold">منتشر شده</span>
        </label>

        {error && <p className="text-brand bg-brand-soft rounded-xl px-4 py-3 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full justify-center"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isNew ? 'افزودن' : 'ذخیره'}
        </button>
      </div>
    </div>
  );
}
