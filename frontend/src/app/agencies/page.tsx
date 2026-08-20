import type { Metadata } from 'next';
import AgenciesClient from '@/components/agencies/AgenciesClient';
import { serverFetch } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'نمایندگی‌ها',
  description:
    'لیست نمایندگی‌های مجاز فروش و خدمات پس از فروش بلانزو در سراسر ایران. پیدا کردن نزدیک‌ترین نمایندگی بلانزو در شهر و استان خود.',
  keywords: [
    'نمایندگی بلانزو',
    'نمایندگی فروش بلانزو',
    'خدمات پس از فروش بلانزو',
    'نمایندگی بلانزو در تهران',
    'نمایندگی بلانزو در اصفهان',
    'نمایندگی بلانزو در شیراز',
    'مرکز خدمات بلانزو',
  ],
  openGraph: {
    title: 'بلانزو | نمایندگی‌ها',
    description: 'لیست نمایندگی‌های مجاز فروش و خدمات پس از فروش بلانزو در سراسر ایران',
    url: 'https://bellanzo-home.ir/agencies',
    images: [
      {
        url: '/og-agencies.jpg',
        width: 1200,
        height: 630,
        alt: 'نمایندگی‌های بلانزو',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلانزو | نمایندگی‌ها',
    description: 'لیست نمایندگی‌های مجاز فروش و خدمات پس از فروش بلانزو',
    images: ['/og-agencies.jpg'],
  },
};

interface Agency {
  id: number;
  province: string;
  province_display: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  code: string;
  agency_type: 'sales' | 'service';
}

export default async function AgenciesPage() {
  const agencies = (await serverFetch<Agency[]>('/agencies/')) ?? [];

  return (
    <>
      <PageHeader page="agencies" title="نمایندگی‌ها" subtitle="نمایندگان مجاز فروش و خدمات" />
      <AgenciesClient agencies={agencies} />
    </>
  );
}
