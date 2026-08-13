import Link from 'next/link';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const img = mediaUrl(product.image);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-3xl border border-line overflow-hidden card-hover"
    >
      <div className="relative aspect-4/3 bg-surface overflow-hidden grid place-items-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-line">
            <ImageIcon size={46} />
            <span className="text-xs text-muted">بدون تصویر</span>
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-3 right-3 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
            ویژه
          </span>
        )}
        {product.is_purchasable && product.price > 0 && (
          <span className="absolute bottom-3 left-3 bg-ink/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full">
            {formatPrice(product.price)} تومان
          </span>
        )}
      </div>
      <div className="p-5">
        {product.category_name && (
          <span className="text-xs text-brand font-bold">{product.category_name}</span>
        )}
        <h3 className="mt-1 font-black text-ink text-lg line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-muted line-clamp-2 h-10">{product.short_description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ink group-hover:text-brand transition-colors">
          مشاهده جزئیات <ArrowLeft size={15} />
        </span>
      </div>
    </Link>
  );
}
