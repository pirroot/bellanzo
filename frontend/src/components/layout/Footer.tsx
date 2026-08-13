"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Camera, Send, Phone, MapPin } from "lucide-react";

const tags = [
  "کیفیت تضمینی",
  "گارانتی معتبر",
  "خدمات پس از فروش",
  "پشتیبانی سریع",
  "نمایندگی سراسری",
  "اعتماد مشتریان",
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-white mt-24">
      {/* Marquee strip */}
      <div className="overflow-hidden border-b border-white/10 py-5">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...tags, ...tags].map((t, i) => (
            <span key={i} className="text-2xl font-black text-white/20 flex items-center gap-12">
              {t}
              <span className="w-2 h-2 rounded-full bg-brand" />
            </span>
          ))}
        </div>
      </div>

      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="mb-4">
            <Image src="/bellanzo-logo.png" alt="بلانزو" width={130} height={44}
              className="h-10 w-auto object-contain rounded-lg" />
          </div>
          <p className="text-white/60 text-sm leading-7">
            بیش از نیم‌قرن تجربه در صنعت لوازم خانگی ایران؛ کیفیت، نوآوری و رضایت مشتری.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-brand transition-colors" aria-label="اینستاگرام">
              <Camera size={18} />
            </a>
            <a href="#" className="grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-brand transition-colors" aria-label="تلگرام">
              <Send size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-brand">دسترسی سریع</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white">خانه</Link></li>
            <li><Link href="/products" className="hover:text-white">محصولات</Link></li>
            <li><Link href="/services" className="hover:text-white">خدمات پس از فروش</Link></li>
            <li><Link href="/contact" className="hover:text-white">درباره و تماس با ما</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-brand">خدمات</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/services#new" className="hover:text-white">ثبت درخواست</Link></li>
            <li><Link href="/services#track" className="hover:text-white">پیگیری درخواست</Link></li>
            <li><Link href="/services#survey" className="hover:text-white">نظرسنجی</Link></li>
            <li><Link href="/agencies" className="hover:text-white">نمایندگی‌ها</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-brand">تماس</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand shrink-0" />
              ۰۲۱-۵۳۴۷۸۰۰۰
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand shrink-0" />
              ۰۲۱-۵۳۴۷۸۴۴۴
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-brand shrink-0 mt-0.5" />
              تهران، میدان شوش، مجتمع تجاری میلاد
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} بلانزو — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
