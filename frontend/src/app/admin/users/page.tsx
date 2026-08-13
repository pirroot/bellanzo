'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, User, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface UserType {
  id: number;
  phone: string;
  username: string;
  full_name: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/admin/users/', { auth: true });
      const usersList = Array.isArray(data) ? data : data?.results || [];
      setUsers(usersList);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err.message || 'خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-muted">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-brand mb-4">{error}</p>
        <button onClick={loadUsers} className="btn btn-primary text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-line">
        <Users size={64} className="mx-auto text-line mb-4" />
        <p className="text-muted">هیچ کاربری ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">کاربران</h1>
          <p className="text-muted text-sm">مدیریت کاربران سایت</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line hover:bg-surface transition-colors text-sm"
        >
          <RefreshCw size={16} />
          بروزرسانی
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="text-right p-4 font-bold">#</th>
              <th className="text-right p-4 font-bold">نام</th>
              <th className="text-right p-4 font-bold hidden sm:table-cell">تلفن</th>
              <th className="text-right p-4 font-bold hidden md:table-cell">ایمیل</th>
              <th className="text-right p-4 font-bold hidden lg:table-cell">تاریخ عضویت</th>
              <th className="text-right p-4 font-bold">نقش</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line hover:bg-surface transition-colors">
                <td className="p-4 font-bold text-ink">#{user.id}</td>
                <td className="p-4 font-medium">{user.full_name || user.username || '—'}</td>
                <td className="p-4 text-muted hidden sm:table-cell">{user.phone}</td>
                <td className="p-4 text-muted hidden md:table-cell">{user.email || '—'}</td>
                <td className="p-4 text-muted hidden lg:table-cell">
                  {new Date(user.date_joined).toLocaleDateString('fa-IR')}
                </td>
                <td className="p-4">
                  {user.is_superuser ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      ادمین
                    </span>
                  ) : user.is_staff ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      کارمند
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      کاربر
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
