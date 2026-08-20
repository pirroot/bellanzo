import type { Metadata } from 'next';
import { Phone, MapPin, Clock, Building2, HelpCircle, MessageCircle } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import FaqClient from '@/components/faq/FaqClient';
import { serverFetch } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'درباره و تماس با ما',
  description:
    'آشنایی با شرکت بلانزو، تولیدکننده و عرضه‌کننده لوازم خانگی با کیفیت در ایران. اطلاعات تماس، آدرس دفتر مرکزی، خدمات پس از فروش و ساعت کاری.',
  keywords: [
    'بلانزو',
    'درباره بلانزو',
    'تماس با بلانزو',
    'آدرس بلانزو',
    'لوازم خانگی بلانزو',
    'تلفن بلانزو',
    'شرکت بلانزو',
  ],
  openGraph: {
    title: 'بلانزو | درباره و تماس با ما',
    description: 'آشنایی با شرکت بلانزو و اطلاعات تماس',
    url: 'https://bellanzo-home.ir/contact',
    images: [
      {
        url: '/og-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'درباره و تماس با بلانزو',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلانزو | درباره و تماس با ما',
    description: 'آشنایی با شرکت بلانزو و اطلاعات تماس',
    images: ['/og-contact.jpg'],
  },
};

const contactInfo = [
  {
    icon: Building2,
    title: 'دفتر مرکزی شرکت',
    value: 'تهران، میدان شوش، خیابان صابونیان، مجتمع تجاری میلاد، طبقه چهارم، واحد ۶۰۹',
  },
  {
    icon: MapPin,
    title: 'دفتر مرکزی خدمات',
    value:
      'تهران، میدان شوش، خیابان صابونیان، مجتمع تجاری میلاد، نبش خیابان آبگینه، فروشگاه بلانزو، پلاک ۲۰۱',
  },
  {
    icon: Phone,
    title: 'تلفن‌های تماس',
    value: '۰۲۱-۵۳۴۷۸۰۰۰  |  ۰۲۱-۵۳۴۷۸۴۴۴',
  },
  { icon: Clock, title: 'ساعت کاری', value: 'شنبه تا چهارشنبه ۹ تا ۱۷' },
];

export default async function ContactPage() {
  let faqs: any[] = [];
  try {
    const data = await serverFetch<any>('/faqs/');
    faqs = Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
  }

  return (
    <>
      <PageHeader
        page="contact" // <--- اضافه کن
        title="تماس با ما"
        subtitle="ارتباط با تیم بلانزو"
      />
      {/* Company Introduction */}
      <section className="container-x py-16 mt-20">
        <Reveal>
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-line p-8 md:p-12 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 bg-brand rounded-full" />
              <h1 className="text-2xl md:text-3xl font-black text-ink">معرفی شرکت بلانزو</h1>
            </div>
            <div className="space-y-6 text-muted leading-9 text-base">
              <p>
                شرکت بلانزو با بیش از نیم قرن تجربه، تخصص و مهارت در صنعت لوازم خانگی ایران،
                به‌عنوان یکی از بازیگران اصلی و تأثیرگذار این بازار شناخته می‌شود. این شرکت با تکیه
                بر دانش فنی، بهره‌گیری از نیروهای متخصص و شناخت دقیق نیازهای مصرف‌کنندگان، همواره در
                زمینه تأمین، تولید و عرضه انواع لوازم خانگی کوچک و لوازم برقی آشپزخانه فعالیتی موفق
                و مستمر داشته است.
              </p>
              <p>
                بلانزو با تمرکز بر حوزه‌هایی نظیر تجهیزات پخت‌وپز برقی، دستگاه‌های تهیه نوشیدنی،
                تجهیزات آماده‌سازی و فرآوری مواد غذایی و سایر لوازم خانگی کوچک، همواره تلاش کرده است
                محصولاتی باکیفیت، کاربردی و مطابق با استانداردهای روز دنیا به بازار عرضه کند.
              </p>
              <p>
                پایبندی به اصول کیفیت، نوآوری، رضایت مشتری و توسعه مستمر، از مهم‌ترین ارزش‌های این
                مجموعه بوده و موجب شده است که برند بلانزو در طول سال‌ها به نامی قابل اعتماد در صنعت
                لوازم خانگی ایران تبدیل شود.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <Reveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-soft text-brand px-4 py-2 rounded-full text-sm font-bold mb-4">
                <HelpCircle size={18} />
                پرسش‌های متداول
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-ink">سوالات متداول</h2>
              <p className="text-muted mt-3 max-w-2xl mx-auto">
                پاسخ به سوالات رایج درباره محصولات، گارانتی و خدمات پس از فروش
              </p>
            </div>
          </Reveal>
          <FaqClient faqs={faqs} />
        </div>
      </section>

      {/* Contact Info */}
      <section className="container-x py-16">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-soft text-brand px-4 py-2 rounded-full text-sm font-bold mb-4">
              <MessageCircle size={18} />
              ارتباط با ما
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-ink">اطلاعات تماس</h2>
            <p className="text-muted mt-3">راه‌های ارتباطی با شرکت بلانزو</p>
          </div>
        </Reveal>
        <Reveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {contactInfo.map((it, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-line p-6 text-center card-hover group"
            >
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-soft text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                <it.icon size={26} />
              </span>
              <div className="text-sm text-muted mb-1">{it.title}</div>
              <div className="font-bold text-ink leading-7 text-sm">{it.value}</div>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
