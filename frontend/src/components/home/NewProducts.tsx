'use client';

import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NewProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container-x py-20">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeading
          eyebrow="جدیدترین"
          title="محصولات جدید"
          subtitle="آخرین محصولات اضافه شده به فروشگاه بلانزو"
        />
        <Link
          href="/products"
          className="btn btn-dark text-sm hidden md:inline-flex items-center gap-2"
        >
          همه محصولات <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product, i) => (
          <Reveal key={product.id} delay={i * 0.08}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
