'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Headphones,
  MessageSquare,
  Star,
  Package,
  MapPin,
  LogOut,
  ExternalLink,
  Settings,
  ClipboardList,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { isAuthed, logout } from '@/lib/auth';

const nav = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'سفارشات', icon: Package },
  { href: '/admin/products', label: 'محصولات', icon: Package },
  { href: '/admin/requests', label: 'درخواست‌های خدمات', icon: Headphones },
  { href: '/admin/messages', label: 'پیام‌های تماس', icon: MessageSquare },
  { href: '/admin/surveys', label: 'نظرسنجی‌ها', icon: Star },
  { href: '/admin/agencies', label: 'نمایندگی‌ها', icon: MapPin },
  { href: '/admin/agency-requests', label: 'درخواست‌های نمایندگی', icon: ClipboardList },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/settings', label: 'تنظیمات سایت', icon: Settings },
];
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-brand font-black">B</span>
          <span className="font-black">پنل مدیریت</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = n.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                active ? 'bg-brand text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <n.icon size={19} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white"
        >
          <ExternalLink size={19} /> مشاهده سایت
        </Link>
        <button
          onClick={() => {
            logout();
            router.replace('/admin/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-brand"
        >
          <LogOut size={19} /> خروج
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!isLogin && !isAuthed()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [isLogin, router, pathname]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (isLogin) return <div className="min-h-screen bg-ink">{children}</div>;
  if (!ready) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-surface">
      {/* Desktop sidebar — fixed on right */}
      <aside className="hidden lg:flex w-64 bg-ink text-white flex-col fixed inset-y-0 right-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile nav drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-ink text-white flex flex-col z-50 lg:hidden transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* Main area — offset from sidebar on desktop */}
      <div className="lg:mr-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between bg-ink text-white px-4 py-3 sticky top-0 z-30 shrink-0">
          <span className="font-black text-sm">پنل مدیریت</span>
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand font-black text-sm">
              B
            </span>
            <button onClick={() => setDrawerOpen(true)} className="text-white/80 hover:text-white">
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden">
          <div className="max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
