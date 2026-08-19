'use client';

import { mediaUrl } from '@/lib/api';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, ImageIcon, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const img = mediaUrl(product.image);
  const hasDiscount = product.discount_price && product.discount_price > 0;
  const isAvailable = product.is_purchasable && product.price > 0 && product.stock > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-3xl border border-line overflow-hidden card-hover relative"
    >
      <div className="relative aspect-4/3 bg-surface overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-line">
            <ImageIcon size={46} />
            <span className="text-xs text-muted mt-2">بدون تصویر</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ⭐ ویژه
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              🔥 تخفیف
            </span>
          )}
        </div>

        {!isAvailable && product.is_purchasable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white/90 text-ink font-black text-sm px-4 py-2 rounded-full shadow-lg">
              ناموجود
            </span>
          </div>
        )}

        {isAvailable && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-ink/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-lg border border-white/10">
              {hasDiscount ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs line-through text-white/50">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-bold text-brand-light">
                    {formatPrice(product.discount_price)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        {product.category_name && (
          <span className="text-xs text-brand font-bold uppercase tracking-wider">
            {product.category_name}
          </span>
        )}
        <h3 className="mt-1.5 font-black text-ink text-lg line-clamp-1 group-hover:text-brand transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-muted line-clamp-2 h-10">{product.short_description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-ink/50 group-hover:text-brand transition-colors duration-300 flex items-center gap-1">
            مشاهده جزئیات{' '}
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
