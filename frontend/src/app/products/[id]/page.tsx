import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowRight, Headphones } from 'lucide-react';
import { serverFetch, mediaUrl } from '@/lib/api';
import type { Product } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import AddToCartButton from '@/components/products/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/products/ProductImage';
import ProductCard from '@/components/ProductCard';

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

  const hasDiscount = product.discount_price && product.discount_price > 0;
  const isOutOfStock = product.stock === 0;

  // Fetch similar products (same category)
  let similarProducts: Product[] = [];
  if (cat && cat.id) {
    const similarData = await serverFetch<{ results: Product[] }>(
      `/products/?category=${cat.slug}&exclude=${product.id}`
    );
    similarProducts = similarData?.results?.slice(0, 4) || [];
  }

  return (
    <>
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
            {/* Image */}
            <Reveal>
              <ProductImage imageSrc={img} alt={product.name} />
            </Reveal>

            {/* Info */}
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

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/services#new" className="btn btn-primary">
                  <Headphones size={18} /> درخواست خدمات این محصول
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-ink">محصولات مشابه</h2>
                <Link
                  href={`/products?category=${cat?.slug || ''}`}
                  className="text-sm text-brand hover:underline font-bold"
                >
                  مشاهده همه
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar - Price & Add to Cart */}
      {product.is_purchasable && product.price > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-line shadow-lg p-4">
          <div className="container-x flex items-center justify-between gap-4 flex-wrap">
            <div>
              {isOutOfStock ? (
                <div className="text-red-500 font-bold text-lg">❌ ناموجود</div>
              ) : (
                <div>
                  {hasDiscount ? (
                    <div>
                      <span className="text-sm line-through text-muted">
                        {formatPrice(product.price)} ریال
                      </span>
                      <div className="text-2xl font-black text-brand">
                        {formatPrice(product.discount_price)} ریال
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-brand">
                      {formatPrice(product.price)} ریال
                    </div>
                  )}
                </div>
              )}
            </div>
            <AddToCartButton
              productId={product.id}
              disabled={isOutOfStock}
              maxStock={product.stock}
            />
          </div>
        </div>
      )}
    </>
  );
}
