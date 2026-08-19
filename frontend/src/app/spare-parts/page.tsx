import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/ui/Reveal';
import { Wrench, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'قطعات یدکی',
  description:
    'قطعات یدکی اصلی و اورجینال برای محصولات بلانزو. خرید قطعات با کیفیت و گارانتی معتبر.',
};

export default async function SparePartsPage() {
  const data = await serverFetch<{ results: Product[] }>('/products/?is_spare_part=true');
  const parts = data?.results || [];

  return (
    <div className="container-x py-16 mt-20">
      {/* Header */}
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
            <ArrowLeft size={16} />
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted mb-6">{parts.length} قطعه یدکی یافت شد</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {parts.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.05}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
