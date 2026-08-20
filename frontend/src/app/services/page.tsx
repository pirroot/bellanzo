import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ClipboardList,
  Cog,
  CheckCircle,
  Truck,
  Phone,
  MapPin,
  Wrench,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import ServicesTabs from '@/components/services/ServicesTabs';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'خدمات پس از فروش',
  description:
    'ثبت و پیگیری درخواست‌های تعمیر، گارانتی و پشتیبانی محصولات بلانزو. خدمات پس از فروش حرفه‌ای با گارانتی ۲۴ ماهه و نمایندگی‌های مجاز در سراسر ایران.',
  keywords: [
    'خدمات پس از فروش بلانزو',
    'تعمیرات بلانزو',
    'گارانتی بلانزو',
    'ثبت درخواست خدمات',
    'پیگیری درخواست',
    'نمایندگی خدمات بلانزو',
    'مرکز خدمات بلانزو',
  ],
  openGraph: {
    title: 'بلانزو | خدمات پس از فروش',
    description: 'ثبت و پیگیری درخواست‌های تعمیر، گارانتی و پشتیبانی',
    url: 'https://bellanzo-home.ir/services',
    images: [
      {
        url: '/og-services.jpg',
        width: 1200,
        height: 630,
        alt: 'خدمات پس از فروش بلانزو',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلانزو | خدمات پس از فروش',
    description: 'ثبت و پیگیری درخواست‌های تعمیر، گارانتی و پشتیبانی',
    images: ['/og-services.jpg'],
  },
};

const steps = [
  { icon: ClipboardList, title: 'ثبت درخواست', desc: 'فرم درخواست را تکمیل کنید.' },
  { icon: Cog, title: 'بررسی کارشناسی', desc: 'تیم فنی درخواست را بررسی می‌کند.' },
  { icon: Truck, title: 'ارائه خدمت', desc: 'تعمیر یا خدمت موردنظر انجام می‌شود.' },
  { icon: CheckCircle, title: 'تحویل و رضایت', desc: 'تحویل نهایی و ثبت بازخورد شما.' },
];

export default async function ServicesPage() {
  // Fetch spare parts
  const sparePartsData = await serverFetch<{ results: Product[] }>(
    '/products/?is_spare_part=true&ordering=-created_at&limit=4'
  );
  const spareParts = sparePartsData?.results || [];

  return (
    <>
      <PageHeader
        page="services"
        title="خدمات پس از فروش"
        subtitle="ثبت و پیگیری درخواست‌های تعمیر، گارانتی و پشتیبانی"
      />

      {/* Warranty Section */}
      <section className="container-x py-16 mt-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
          {/* Left: Warranty text */}
          <Reveal className="space-y-6 order-2 lg:order-1">
            {/* مشتری گرامی */}
            <div className="bg-white rounded-3xl border border-line p-7">
              <h2 className="text-lg font-black text-ink mb-4">مشتری گرامی</h2>
              <p className="text-sm leading-8 text-muted">
                با تشکر از اعتماد شما، این محصول بر اساس شرایط زیر تحت گارانتی می‌باشد. لطفاً دقت
                بفرمایید <span className="text-ink font-bold">(تاریخ و مهر فروشنده)</span> تکمیل
                گردد. (ضمانت‌نامه‌هایی که تکمیل نشده یا دارای خط‌خوردگی باشد از درجه اعتبار ساقط
                است). در ضمن در صورت بروز نقص فنی در مدت گارانتی، دستگاه را به همراه ضمانت نامه و
                فاکتور خرید ممهور به مهر فروشنده به نماینده خدمات معرفی شده ارائه نمایید.
              </p>
            </div>

            {/* شرایط ضمانت */}
            <div className="bg-white rounded-3xl border border-line p-7">
              <h2 className="text-lg font-black text-ink mb-5">شرایط ضمانت</h2>
              <ol className="space-y-3 text-sm leading-7 text-muted list-decimal list-inside">
                <li>
                  محصولات صرفاً جهت مصارف خانگی می‌باشد، در غیر این صورت چنانچه فوق جهت مصرف غیر
                  خانگی استفاده گردد گارانتی و خدمات پس از فروش شامل این محصولات نمی‌گردد.
                </li>
                <li>
                  دستگاه خریداری شده بایستی توسط مشتری به لحاظ ظاهری سالم و کامل تحویل گرفته شود.
                </li>
                <li>محصولات بدون ضمانت‌نامه از خدمات گارانتی برخوردار نمی‌باشد.</li>
                <li>شکستگی قطعات شامل گارانتی نمی‌باشد.</li>
                <li>
                  صدمات ناشی از حوادث طبیعی، حمل و نقل، استفاده غلط، نوسانات برق و لوازم مصرفی شامل
                  ضمانت نامه نمیباشد.
                </li>
                <li>
                  هر نوع تعمیر در مدت ضمانت، فقط توسط تعمیرگاه‌های مجاز انجام می‌گردد. در غیر این
                  صورت از درجه اعتبار ساقط است.
                </li>
                <li>دستمزد و بهای قطعات تعویض شده در مدت ضمانت دریافت نمی شود.</li>
                <li>مدت ضمانت از تاریخ خرید ۲۴ ماه می‌باشد.</li>
                <li>
                  در مدت زمان گارانتی هزینه ارسال و دریافت کالا به مراکز خدمات پس از فروش بر عهده
                  شرکت می باشد.
                </li>
              </ol>
            </div>

            {/* اطلاعات تماس */}
            <div className="bg-ink rounded-3xl p-7 text-white">
              <h2 className="text-lg font-black mb-5">اطلاعات تماس مرکز خدمات مرکزی</h2>
              <ul className="space-y-3 text-sm text-white/75 leading-7">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="text-brand mt-0.5 shrink-0" />
                  تهران، میدان شوش، خیابان صابونیان، مجتمع تجاری میلاد، پلاک ۲۰۱
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-brand shrink-0" />
                  <span dir="ltr">۵۳۴۷۸۸۰۰-۰۲۱</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-brand shrink-0" />
                  ارتباط سریع: ۰۹۲۰۱۱۸۳۲۵۲
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Right: Warranty card image */}
          <Reveal delay={0.15} className="lg:sticky lg:top-24 order-1 lg:order-2">
            <Image
              src="/garanti.png"
              alt="کارت گارانتی بلانزو"
              width={420}
              height={580}
              className="w-full h-auto rounded-3xl shadow-xl"
              priority
            />
          </Reveal>
        </div>
      </section>

      {/* Spare Parts Section */}
      {spareParts.length > 0 && (
        <section className="container-x pb-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-brand font-bold text-sm mb-1">
                  <Wrench size={18} />
                  قطعات یدکی
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-ink">قطعات اصلی و اورجینال</h2>
                <p className="text-muted text-sm mt-1">
                  قطعات یدکی معتبر برای محصولات بلانزو با گارانتی اصالت
                </p>
              </div>
              <Link
                href="/spare-parts"
                className="btn btn-primary text-sm hidden md:inline-flex items-center gap-2"
              >
                مشاهده همه قطعات <ArrowLeft size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {spareParts.map((part, i) => (
                <Reveal key={part.id} delay={i * 0.05}>
                  <ProductCard product={part} />
                </Reveal>
              ))}
            </div>

            <div className="mt-6 text-center md:hidden">
              <Link href="/spare-parts" className="btn btn-primary inline-flex items-center gap-2">
                مشاهده همه قطعات <ArrowLeft size={16} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* Process timeline */}
      <section className="container-x py-20">
        <SectionHeading center eyebrow="فرآیند خدمات" title="چطور کار می‌کند؟" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative h-full bg-white rounded-3xl border border-line p-7 card-hover">
                <span className="absolute -top-4 right-7 grid place-items-center w-9 h-9 rounded-full bg-ink text-white font-black text-sm">
                  {i + 1}
                </span>
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-soft text-brand mb-5">
                  <s.icon size={26} />
                </span>
                <h3 className="font-black text-lg text-ink mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-7">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Forms */}
      <section className="bg-surface" id="track">
        <div className="container-x py-20">
          <SectionHeading center eyebrow="پنل خدمات" title="درخواست خود را ثبت یا پیگیری کنید" />
          <div id="survey" className="mt-12">
            <ServicesTabs />
          </div>
        </div>
      </section>
    </>
  );
}
