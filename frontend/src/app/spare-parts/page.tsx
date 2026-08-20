import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/ui/Reveal';
import { Wrench, ArrowLeft, Package } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'قطعات یدکی',
  description: 'قطعات یدکی اصلی و اورجینال برای محصولات بلانزو.',
};

export default async function SparePartsPage() {
  const data = await serverFetch<{ results: Product[] }>('/products/?is_spare_part=true');
  const parts = data?.results || [];

  return (
    <>
      <PageHeader page="spare-parts" title="قطعات یدکی" subtitle="قطعات اصلی و اورجینال" />
      <div className="container-x py-16 mt-20">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-8 bg-brand rounded-full" />
            <h1 className="text-2xl md:text-3xl font-black text-ink">قطعات یدکی</h1>
          </div>
          <p className="text-muted max-w-2xl">
            قطعات اصلی و اورجینال برای محصولات بلانزو. با گارانتی معتبر و کیفیت تضمینی.
          </p>
        </div>

        {parts.length === 0 ? (
          <div className="text-center py-20">
            <Wrench size={64} className="mx-auto text-line mb-4" />
            <p className="text-muted text-lg">قطعه یدکی برای نمایش وجود ندارد.</p>
            <Link href="/products" className="btn btn-primary mt-4 inline-flex items-center gap-2">
              <ArrowLeft size={16} /> مشاهده محصولات
            </Link>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted mb-6">{parts.length} قطعه یدکی یافت شد</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {parts.map((part, i) => (
                <Reveal key={part.id} delay={i * 0.05}>
                  <div className="relative">
                    <ProductCard product={part} />
                    {part.main_product_name && (
                      <div className="absolute top-2 left-2 bg-ink/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Package size={10} />
                        {part.main_product_name}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
