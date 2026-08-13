'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { mediaUrl } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/ui/Reveal';

function CategoryCard({ cat, onClick }: { cat: Category; onClick: () => void }) {
  const img = mediaUrl(cat.image);
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          aspectRatio: '4/5',
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden bg-ink cursor-pointer"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={onClick}
        >
          {img ? (
            <img
              src={img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/10">
              <ImageIcon size={56} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6">
            <h3 className="text-white font-black text-xl">{cat.name}</h3>
            <span className="mt-1 text-white/60 text-sm">{cat.product_count} محصول</span>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-3xl overflow-hidden bg-ink flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {img && (
            <img
              src={img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-ink/80" />
          <div className="relative z-10 flex flex-col h-full p-6">
            <h3 className="text-white font-black text-lg mb-4 border-b border-white/20 pb-3">
              {cat.name}
            </h3>
            <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {cat.sub_items && cat.sub_items.length > 0 ? (
                cat.sub_items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.link}
                      className="block text-white/80 hover:text-brand font-bold text-sm py-1 transition-colors"
                    >
                      • {item.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <button
                    onClick={onClick}
                    className="block text-white/60 text-sm py-1 text-right w-full"
                  >
                    مشاهده همه محصولات
                  </button>
                </li>
              )}
            </ul>
            <button
              onClick={onClick}
              className="mt-4 block w-full text-center bg-brand text-white font-bold text-sm py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
            >
              مشاهده همه
            </button>
          </div>
        </div>
      </div>

      <button
        className="md:hidden absolute inset-0 z-20 rounded-3xl"
        onClick={onClick}
        aria-label="مشاهده محصولات"
      />
    </div>
  );
}

export default function ProductsClient({
  categories,
  initialProducts,
  activeCategory,
  activeSearch,
}: {
  categories: Category[];
  initialProducts: Product[];
  activeCategory: string;
  activeSearch: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(activeSearch);

  function navigate(cat: string, q: string) {
    const sp = new URLSearchParams();
    if (cat) sp.set('category', cat);
    if (q) sp.set('search', q);
    startTransition(() => router.push(`/products?${sp.toString()}`));
  }

  const selectedCat = categories.find((c) => c.slug === activeCategory);

  if (!activeCategory) {
    return (
      <div className="container-x py-12 mt-20">
        {categories.length === 0 ? (
          <p className="text-center text-muted py-20">دسته‌بندی‌ای یافت نشد.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Reveal key={cat.id}>
                <CategoryCard cat={cat} onClick={() => navigate(cat.slug, '')} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container-x py-12 mt-20">
      <div className="flex items-center gap-2 text-sm text-muted mb-8">
        <button
          onClick={() => navigate('', '')}
          className="hover:text-brand font-bold transition-colors"
        >
          دسته‌بندی‌ها
        </button>
        <ArrowRight size={14} />
        <span className="text-ink font-bold">{selectedCat?.name ?? activeCategory}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-ink">{selectedCat?.name}</h2>
          <p className="text-muted text-sm mt-1">{initialProducts.length} محصول یافت شد</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(activeCategory, search);
          }}
          className="relative w-full sm:w-72"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در این دسته..."
            className="w-full rounded-full border border-line bg-white py-2.5 pr-11 pl-4 outline-none focus:border-brand text-sm transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full bg-brand text-white"
          >
            <Search size={15} />
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSearch('');
              navigate(c.slug, '');
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              c.slug === activeCategory
                ? 'bg-brand text-white'
                : 'bg-white border border-line text-ink-soft hover:border-brand'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {initialProducts.length === 0 ? (
        <p className="py-20 text-center text-muted">محصولی در این دسته یافت نشد.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
