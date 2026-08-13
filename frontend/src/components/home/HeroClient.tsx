"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Award, Headphones } from "lucide-react";

const icons = { award: Award, shield: ShieldCheck, phone: Headphones };
const stats = [
  { icon: "award" as const, value: "+۱۰", label: "سال تجربه" },
  { icon: "shield" as const, value: "۲۴ ماه", label: "گارانتی" },
  { icon: "phone" as const, value: "۲۴/۷", label: "پشتیبانی" },
];

export default function HeroClient({
  badge, line1, line2, subtitle,
}: {
  badge: string; line1: string; line2: string; subtitle: string;
}) {
  return (
    <div>
      <motion.span
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-brand-soft text-brand font-bold text-sm px-4 py-2 rounded-full"
      >
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        {badge}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mt-6 text-4xl md:text-6xl font-black leading-[1.15] text-ink"
      >
        {line1}
        <br />
        <span className="text-gradient-red">{line2}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-6 text-lg text-muted leading-8 max-w-lg"
      >
        {subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-9 flex flex-wrap gap-4"
      >
        <Link href="/products" className="btn btn-primary">
          مشاهده محصولات <ArrowLeft size={18} />
        </Link>
        <Link href="/services#new" className="btn btn-outline">
          ثبت درخواست خدمات
        </Link>
      </motion.div>

      <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
        {stats.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <Icon className="mx-auto text-brand mb-2" size={22} />
              <div className="text-2xl font-black text-ink">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
