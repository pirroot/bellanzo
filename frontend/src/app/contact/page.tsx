import type { Metadata } from 'next';
import { Phone, MapPin, Clock, Building2 } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import FAQComponent from '@/components/faq/FAQComponent';

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

export default function ContactPage() {
  return (
    <>
      {/* Company Introduction */}
      <section className="container-x py-16 mt-20">
        <Reveal>
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-line p-8 md:p-12">
            <h1 className="text-2xl md:text-3xl font-black text-ink mb-8">معرفی شرکت بلانزو</h1>
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

      {/* <FAQComponent /> */}

      {/* Contact Info */}
      <section className="bg-surface">
        <div className="container-x py-16">
          <Reveal className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
            {contactInfo.map((it) => (
              <div
                key={it.title}
                className="flex items-start gap-4 bg-white rounded-2xl border border-line p-5"
              >
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand-soft text-brand shrink-0 mt-0.5">
                  <it.icon size={22} />
                </span>
                <div>
                  <div className="text-sm text-muted">{it.title}</div>
                  <div className="font-bold text-ink leading-7">{it.value}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
