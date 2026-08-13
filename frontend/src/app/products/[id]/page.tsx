import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ImageIcon, ArrowRight, Headphones } from 'lucide-react';
import { serverFetch, mediaUrl } from '@/lib/api';
import type { Product } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import AddToCartButton from '@/components/products/AddToCartButton';
import { formatPrice } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await serverFetch<Product>(`/products/${id}/`);

  if (!product) {
    return {
      title: 'محصول یافت نشد',
    };
  }

  const catName = typeof product.category === 'object' ? product.category?.name : '';

  return {
    title: product.name,
    description:
      product.short_description ||
      product.description ||
      `خرید ${product.name} با کیفیت بالا و گارانتی معتبر از برند بلانزو.`,
    keywords: [
      product.name,
      catName,
      'بلانزو',
      'لوازم خانگی',
      'خرید لوازم خانگی',
      'قیمت لوازم خانگی',
    ].filter(Boolean),
    openGraph: {
      title: product.name,
      description:
        product.short_description || product.description || `خرید ${product.name} با کیفیت بالا`,
      url: `https://bellanzo-home.ir/products/${id}`,
      images: product.image
        ? [
            {
              url: product.image,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description:
        product.short_description || product.description || `خرید ${product.name} با کیفیت بالا`,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const product = await serverFetch<Product>(`/products/${id}/`);
  if (!product) notFound();

  const img = mediaUrl(product.image);
  const cat = typeof product.category === 'object' ? product.category : null;

  return (
    <div className="pt-28 pb-20">
      <div className="container-x">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-brand">
            خانه
          </Link>
          <ArrowRight size={14} />
          <Link href="/products" className="hover:text-brand">
            محصولات
          </Link>
          <ArrowRight size={14} />
          <span className="text-ink font-bold">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div className="relative aspect-square rounded-3xl bg-surface border border-line overflow-hidden grid place-items-center">
              {img ? (
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={70} className="text-line" />
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {cat && <span className="text-brand font-bold text-sm">{cat.name}</span>}
            <h1 className="mt-2 text-3xl md:text-4xl font-black text-ink">{product.name}</h1>
            <p className="mt-4 text-muted leading-8">{product.short_description}</p>

            {product.description && (
              <p className="mt-4 text-ink-soft leading-8">{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <ul className="mt-6 space-y-3">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-soft text-brand">
                      <Check size={14} />
                    </span>
                    <span className="text-ink-soft">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Price & Add to Cart */}
            {product.is_purchasable && product.price > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-brand-soft border border-brand/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-sm text-muted">قیمت</span>
                    <div className="text-2xl font-black text-brand">
                      {formatPrice(product.price.toLocaleString())} تومان
                    </div>
                  </div>
                  <AddToCartButton productId={product.id} />
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/services#new" className="btn btn-primary">
                <Headphones size={18} /> درخواست خدمات این محصول
              </Link>
              <Link href="/contact" className="btn btn-outline">
                مشاوره و استعلام
              </Link>
            </div>

            {!product.is_purchasable && (
              <div className="mt-8 p-5 rounded-2xl bg-surface border border-line text-sm text-muted leading-7">
                این محصول در فاز فعلی صرفاً جهت معرفی نمایش داده می‌شود. امکان خرید آنلاین در فازهای
                بعدی فعال خواهد شد.
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
