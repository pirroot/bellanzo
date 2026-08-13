"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/lib/types";

export default function ProductFilter({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const activeCat = params.get("category") || "";
  const [q, setQ] = useState(params.get("search") || "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    router.push(`/products?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ search: q });
        }}
        className="relative max-w-md"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی محصول..."
          className="w-full rounded-full border border-line bg-white py-3 pr-12 pl-4 outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-brand text-white"
          aria-label="جستجو"
        >
          <Search size={17} />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => apply({ category: "" })}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            !activeCat
              ? "bg-brand text-white"
              : "bg-white border border-line text-ink-soft hover:border-brand"
          }`}
        >
          همه
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => apply({ category: c.slug })}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeCat === c.slug
                ? "bg-brand text-white"
                : "bg-white border border-line text-ink-soft hover:border-brand"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
