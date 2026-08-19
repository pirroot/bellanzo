'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Newspaper } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import type { Post } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function BlogPreview({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="container-x py-20 ">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeading
          eyebrow="مجله بلانزو"
          title="جدیدترین مطالب"
          subtitle="مقالات آموزشی و راهنمای خرید لوازم خانگی"
        />
        <Link
          href="/blog"
          className="btn btn-dark text-sm hidden md:inline-flex items-center gap-2"
        >
          مشاهده همه <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.slice(0, 4).map((post, i) => {
          const img = mediaUrl(post.image);
          return (
            <Reveal key={post.id} delay={i * 0.08}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-3xl border border-line overflow-hidden card-hover"
              >
                <div className="relative aspect-video bg-surface overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-line">
                      <Newspaper size={40} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('fa-IR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} /> {post.author || 'بلانزو'}
                    </span>
                  </div>
                  <h3 className="font-black text-sm line-clamp-2 group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{post.excerpt}</p>
                  <span className="mt-2 inline-block text-xs font-bold text-brand">
                    بیشتر بخوانید ←
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* Mobile button */}
      <div className="mt-8 text-center md:hidden">
        <Link href="/blog" className="btn btn-primary inline-flex items-center gap-2">
          مشاهده همه مطالب <ArrowLeft size={16} />
        </Link>
      </div>
    </section>
  );
}
