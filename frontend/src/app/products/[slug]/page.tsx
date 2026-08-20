import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowRight, Headphones, Wrench } from 'lucide-react';
import { serverFetch, mediaUrl } from '@/lib/api';
import type { Product } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import AddToCartButton from '@/components/products/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/products/ProductImage';
import ProductCard from '@/components/ProductCard';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverFetch<Product>(`/products/${slug}/`);

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
      url: `https://bellanzo-home.ir/products/${slug}`,
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
  const { slug } = await params;
  const product = await serverFetch<Product>(`/products/${slug}/`);

  if (!product) notFound();

  const img = mediaUrl(product.image);
  const cat = typeof product.category === 'object' ? product.category : null;

  // 🔥 بررسی اینکه آیا محصول قطعه یدکی است
  const isSparePart = product.is_spare_part === true;

  const hasDiscount = product.discount_price && product.discount_price > 0;
  const isOutOfStock = product.stock === 0;

  // 🔥 دریافت محصول اصلی (اگر قطعه یدکی باشد)
  let mainProduct: Product | null = null;
  if (isSparePart && product.main_product) {
    try {
      // اگر main_product یک عدد است (ID)
      if (typeof product.main_product === 'number') {
        // برای دریافت محصول اصلی باید از API استفاده کنیم
        const mainProductData = await serverFetch<Product>(`/products/${product.main_product}/`);
        mainProduct = mainProductData;
      }
      // اگر main_product یک object است
      else if (typeof product.main_product === 'object' && product.main_product?.slug) {
        mainProduct = product.main_product as Product;
      }
    } catch (error) {
      console.error('Error fetching main product:', error);
      mainProduct = null;
    }
  }

  // 🔥 دریافت قطعات یدکی مرتبط با این محصول (فقط برای محصولات معمولی)
  let relatedParts: Product[] = [];
  if (!isSparePart && product.id) {
    try {
      const partsData = await serverFetch<{ results: Product[] }>(
        `/products/?main_product=${product.id}&is_spare_part=true`
      );
      relatedParts = partsData?.results?.slice(0, 4) || [];
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      relatedParts = [];
    }
  }

  // 🔥 دریافت جدیدترین محصولات همین دسته (۴ تا)
  let categoryProducts: Product[] = [];
  if (cat && cat.id) {
    try {
      const catData = await serverFetch<{ results: Product[] }>(
        `/products/?category=${cat.slug}&exclude=${product.id}&is_spare_part=false&ordering=-created_at&limit=4`
      );
      categoryProducts = catData?.results?.slice(0, 4) || [];
    } catch (error) {
      console.error('Error fetching category products:', error);
      categoryProducts = [];
    }
  }

  // 🔥 دریافت محصولات مشابه (۴ تا)
  let similarProducts: Product[] = [];
  if (cat && cat.id) {
    try {
      const similarData = await serverFetch<{ results: Product[] }>(
        `/products/?category=${cat.slug}&exclude=${product.id}&is_spare_part=false&ordering=name&limit=4`
      );
      similarProducts = similarData?.results?.slice(0, 4) || [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      similarProducts = [];
    }
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
            {isSparePart && mainProduct && (
              <>
                <Link href={`/products/${mainProduct.slug}`} className="hover:text-brand">
                  {mainProduct.name}
                </Link>
                <ArrowRight size={14} />
              </>
            )}
            <span className="text-ink font-bold">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <Reveal>
              <ProductImage imageSrc={img} alt={product.name} />
            </Reveal>

            {/* Info */}
            <Reveal delay={0.1}>
              {isSparePart ? (
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Wrench size={14} /> قطعه یدکی
                  </span>
                  {mainProduct && (
                    <Link
                      href={`/products/${mainProduct.slug}`}
                      className="text-xs text-brand hover:underline"
                    >
                      مناسب برای {mainProduct.name}
                    </Link>
                  )}
                </div>
              ) : (
                cat && <span className="text-brand font-bold text-sm">{cat.name}</span>
              )}

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

          {/* 🔥 قطعات یدکی مرتبط - فقط برای محصولات معمولی */}
          {!isSparePart && relatedParts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-ink flex items-center gap-2">
                  <span>🔧</span> قطعات یدکی مرتبط
                </h2>
                <Link href="/spare-parts" className="text-sm text-brand hover:underline font-bold">
                  مشاهده همه قطعات
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedParts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* 🔥 جدیدترین محصولات همین دسته */}
          {categoryProducts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-ink">
                  {isSparePart ? 'جدیدترین قطعات یدکی' : `جدیدترین محصولات ${cat?.name}`}
                </h2>
                <Link
                  href={isSparePart ? '/spare-parts' : `/products?category=${cat?.slug || ''}`}
                  className="text-sm text-brand hover:underline font-bold"
                >
                  مشاهده همه
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categoryProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* 🔥 محصولات مشابه */}
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

      {/* نوار پایین ثابت - قیمت و دکمه افزودن به سبد خرید */}
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
                        {formatPrice(product.price)}
                      </span>
                      <div className="text-2xl font-black text-brand">
                        {formatPrice(product.discount_price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-brand">
                      {formatPrice(product.price)}
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
