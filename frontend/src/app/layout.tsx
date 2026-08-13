import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/Preloader';

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'بلانزو | فروشگاه لوازم خانگی و خدمات پس از فروش',
    template: '%s | بلانزو',
  },
  description:
    'فروشگاه اینترنتی بلانزو - ارائه محصولات با کیفیت، خدمات پس از فروش حرفه‌ای، گارانتی معتبر و نمایندگی‌های مجاز در سراسر ایران.',
  keywords: [
    'بلانزو',
    'فروشگاه لوازم خانگی',
    'خدمات پس از فروش',
    'گارانتی',
    'نمایندگی بلانزو',
    'لوازم خانگی',
    'تعمیرات',
  ],
  authors: [{ name: 'Bellanzo' }],
  creator: 'Bellanzo',
  publisher: 'Bellanzo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'بلانزو | فروشگاه لوازم خانگی',
    description: 'خرید لوازم خانگی با کیفیت و خدمات پس از فروش حرفه‌ای',
    url: 'https://bellanzo-home.ir',
    siteName: 'بلانزو',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'بلانزو',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلانزو | فروشگاه لوازم خانگی',
    description: 'خرید لوازم خانگی با کیفیت و خدمات پس از فروش حرفه‌ای',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://bellanzo-home.ir',
  },
  category: 'Shopping',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} h-full antialiased`}>
      <head>
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
        <meta name="theme-color" content="#e11d2a" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-ink">
        <Preloader />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
