"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import type { Category } from "@/lib/types";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { useState } from "react";

function CategoryCard({ c }: { c: Category }) {
  const img = mediaUrl(c.image);
  const [flipped, setFlipped] = useState(false);

  return (
    <Reveal>
      <div
        className="relative"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* Card wrapper */}
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            aspectRatio: "4/5",
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden bg-ink"
            style={{ backfaceVisibility: "hidden" }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover opacity-75"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/10">
                <ImageIcon size={56} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <h3 className="text-white font-black text-xl">{c.name}</h3>
              <span className="mt-1 text-white/60 text-sm">
                {c.product_count} محصول
              </span>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden bg-ink flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* dim background image */}
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
            )}
            <div className="absolute inset-0 bg-ink/80" />
            <div className="relative z-10 flex flex-col h-full p-6">
              <h3 className="text-white font-black text-lg mb-4 border-b border-white/20 pb-3">
                {c.name}
              </h3>
              <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {c.sub_items && c.sub_items.length > 0 ? (
                  c.sub_items.map((item, idx) => (
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
                    <Link
                      href={`/products?category=${c.slug}`}
                      className="block text-white/60 text-sm py-1"
                    >
                      مشاهده همه محصولات
                    </Link>
                  </li>
                )}
              </ul>
              <Link
                href={`/products?category=${c.slug}`}
                className="mt-4 block text-center bg-brand text-white font-bold text-sm py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
              >
                مشاهده همه
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile tap button */}
        <button
          className="md:hidden absolute inset-0 z-20 rounded-3xl"
          onClick={() => setFlipped((v) => !v)}
          aria-label="نمایش زیرمنو"
        />
      </div>
    </Reveal>
  );
}

interface CategoriesProps {
  cats: Category[];
}

export default function Categories({ cats }: CategoriesProps) {
  if (cats.length === 0) return null;

  return (
    <section className="container-x py-20">
      <SectionHeading
        center
        eyebrow="دسته‌بندی‌ها"
        title="بر اساس نیاز خود انتخاب کنید"
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => (
          <CategoryCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}
