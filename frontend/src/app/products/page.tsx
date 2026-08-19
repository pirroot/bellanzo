import type { Metadata } from 'next';
import { serverFetch } from '@/lib/api';
import type { Category, Paginated, Product } from '@/lib/types';
import ProductsClient from '@/components/products/ProductsClient';

export const metadata: Metadata = {
  title: 'محصولات',
  description:
    'خرید انواع لوازم خانگی با کیفیت از برند بلانزو. ماشین لباسشویی، یخچال، اجاق گاز، جاروبرقی و ... با گارانتی معتبر و خدمات پس از فروش حرفه‌ای.',
  keywords: [
    'محصولات بلانزو',
    'لوازم خانگی',
    'خرید لوازم خانگی',
    'قیمت لوازم خانگی',
    'ماشین لباسشویی',
    'یخچال',
    'اجاق گاز',
    'جاروبرقی',
    'بلانزو',
  ],
  openGraph: {
    title: 'بلانزو | محصولات',
    description: 'خرید انواع لوازم خانگی با کیفیت و گارانتی معتبر',
    url: 'https://bellanzo-home.ir/products',
    images: [
      {
        url: '/og-products.jpg',
        width: 1200,
        height: 630,
        alt: 'محصولات بلانزو',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلانزو | محصولات',
    description: 'خرید انواع لوازم خانگی با کیفیت و گارانتی معتبر',
    images: ['/og-products.jpg'],
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const query = new URLSearchParams();
  if (sp.category) query.set('category', sp.category);
  if (sp.search) query.set('search', sp.search);

  const [cats, data] = await Promise.all([
    serverFetch<Category[]>('/categories/'),
    serverFetch<Paginated<Product>>(`/products/?${query.toString()}`),
  ]);

  return (
    <>
      <ProductsClient
        categories={cats ?? []}
        initialProducts={data?.results ?? []}
        activeCategory={sp.category ?? ''}
        activeSearch={sp.search ?? ''}
      />
    </>
  );
}
