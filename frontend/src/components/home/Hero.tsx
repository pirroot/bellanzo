import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Award, Headphones } from 'lucide-react';
import { serverFetch, mediaUrl } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';
import HeroClient from './HeroClient';

const stats = [
  { icon: 'award', value: '+۱۰', label: 'سال تجربه' },
  { icon: 'shield', value: '۲۴ ماه', label: 'گارانتی' },
  { icon: 'phone', value: '۲۴/۷', label: 'پشتیبانی' },
];

export default async function Hero() {
  const settings = await serverFetch<SiteSettings>('/settings/');
  const badge = settings?.hero_badge || 'برند مورد اعتماد شما';
  const line1 = settings?.hero_title_line1 || 'تجربه‌ای نو از';
  const line2 = settings?.hero_title_line2 || 'کیفیت و خدمات';
  const subtitle =
    settings?.hero_subtitle ||
    'محصولاتی که می‌توانید به آن‌ها اعتماد کنید، در کنار خدمات پس از فروشی که خیال شما را راحت می‌کند.';
  const ctaLabel = settings?.hero_cta_label || 'مشاهده محصولات';
  const ctaLink = settings?.hero_cta_link || '/products';
  const bgImage = settings?.hero_bg_image ? mediaUrl(settings.hero_bg_image) : null;
  const productImage = settings?.hero_product_image ? mediaUrl(settings.hero_product_image) : null;

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background */}
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 noise-grid opacity-[0.5]" />
      )}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-brand/20 blur-[120px]" />
      <div className="absolute top-1/2 -right-24 w-[360px] h-[360px] rounded-full bg-brand/10 blur-[100px]" />

      <div className="container-x relative grid lg:grid-cols-2 gap-14 items-center">
        {/* Text */}
        <HeroClient
          badge={badge}
          line1={line1}
          line2={line2}
          subtitle={subtitle}
          ctaLabel={ctaLabel}
          ctaLink={ctaLink}
        />

        {/* Product image */}
        <div className="relative flex items-center justify-center">
          <img
            src={productImage ?? '/Mat.png'}
            alt="محصولات بلانزو"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
          <div className="absolute bottom-4 -right-2 md:right-4 bg-white shadow-2xl rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-soft text-brand">
              <ShieldCheck size={20} />
            </span>
            <div>
              <div className="font-black text-ink text-sm">گارانتی اصالت</div>
              <div className="text-xs text-muted">۱۰۰٪ تضمینی</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
