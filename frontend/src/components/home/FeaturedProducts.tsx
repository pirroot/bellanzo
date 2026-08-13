import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Paginated, Product } from "@/lib/types";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/ui/Reveal";

export default async function FeaturedProducts() {
  const data = await serverFetch<Paginated<Product>>(
    "/products/?featured=true"
  );
  const products = data?.results ?? [];

  return (
    <section className="container-x py-20">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeading
          eyebrow="محصولات منتخب"
          title="جدیدترین و محبوب‌ترین‌ها"
          subtitle="گزیده‌ای از محصولات با کیفیت برتر و خدمات پس از فروش تضمینی."
        />
        <Link href="/products" className="btn btn-dark text-sm hidden md:inline-flex">
          همه محصولات <ArrowLeft size={16} />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-muted">به‌زودی محصولات اضافه می‌شوند.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
