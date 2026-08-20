'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, LogOut, UserCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { Cart } from '@/lib/types';

const links = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
  { href: '/services', label: 'خدمات پس از فروش' },
  { href: '/agencies', label: 'نمایندگی‌ها' },
  { href: '/blog', label: 'وبلاگ' },
  { href: '/contact', label: 'درباره و تماس با ما' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const isAdmin = pathname?.startsWith('/admin');

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.full_name || user.phone || 'کاربر');
      } catch {}
    }
  }, []);

  // Load cart count
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [isLoggedIn, pathname]);

  // Listen for cart-updated event
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isLoggedIn) fetchCartCount();
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [isLoggedIn]);

  const fetchCartCount = async () => {
    try {
      const cart = await apiFetch<Cart>('/cart/', { auth: true });
      setCartCount(cart.items_count || 0);
    } catch {
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    setCartCount(0);
    router.push('/');
  };

  if (isAdmin) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-lg shadow-[0_8px_30px_-12px_rgba(0,0,0,.15)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex items-center justify-between h-16 md:h-22">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/bellanzo-logo.png"
            alt="بلانزو"
            width={180}
            height={56}
            className="h-12 md:h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative px-3 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${
                    active
                      ? 'text-brand'
                      : scrolled
                        ? 'text-ink-soft hover:text-brand'
                        : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className={`absolute inset-0 -z-10 rounded-full ${scrolled ? 'bg-brand-soft' : 'bg-white/20'}`}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side: Cart + User + Service Button */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative w-9 h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center hover:bg-brand-soft transition-colors"
          >
            <ShoppingBag size={20} className={scrolled ? 'text-ink' : 'text-gray-500'} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-brand/10 flex items-center justify-center hover:bg-brand/20 transition-colors"
              >
                <User size={20} className="text-brand" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-11 xl:top-12 w-56 bg-white border border-line rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-line">
                      <p className="text-sm font-bold truncate">{userName || 'کاربر'}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-soft transition-colors text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircle size={18} />
                        پروفایل من
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm w-full"
                      >
                        <LogOut size={18} />
                        خروج
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-9 h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center hover:bg-brand-soft transition-colors"
            >
              <User size={20} className={scrolled ? 'text-ink' : 'text-gray-500'} />
            </Link>
          )}

          <Link
            href="/services#new"
            className="btn btn-primary text-xs xl:text-sm px-4 py-2 xl:px-5 xl:py-2.5"
          >
            ثبت درخواست خدمات
          </Link>
        </div>

        {/* Mobile: Cart + User + Menu */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Cart - Mobile */}
          <Link
            href="/cart"
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-brand-soft transition-colors"
          >
            <ShoppingBag size={20} className={scrolled ? 'text-ink' : 'text-gray-500'} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User - Mobile */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-brand/10 flex items-center justify-center hover:bg-brand/20 transition-colors"
              >
                <User size={20} className="text-brand" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-11 xl:top-12 w-56 bg-white border border-line rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-line">
                      <p className="text-sm font-bold truncate">{userName || 'کاربر'}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-soft transition-colors text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircle size={18} />
                        پروفایل من
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm w-full"
                      >
                        <LogOut size={18} />
                        خروج
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-9 h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center hover:bg-brand-soft transition-colors"
            >
              <User size={20} className={scrolled ? 'text-ink' : 'text-gray-500'} />
            </Link>
          )}

          {/* Menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid place-items-center w-9 h-9 rounded-lg bg-ink text-white"
            aria-label="منو"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-line max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <ul className="container-x py-3 flex flex-col gap-0.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block px-4 py-3 rounded-xl font-bold text-sm ${
                      pathname === l.href
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-soft hover:bg-surface'
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}

              <li className="pt-2 border-t border-line mt-2">
                <Link
                  href="/services#new"
                  className="btn btn-primary w-full text-sm justify-center"
                >
                  ثبت درخواست خدمات
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
