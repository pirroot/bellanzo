import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { serverFetch, mediaUrl } from '@/lib/api';
import Reveal from '@/components/ui/Reveal';
import { Calendar, User } from 'lucide-react';
import { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: 'وبلاگ',
  description: 'مطالب و مقالات آموزشی بلانزو در مورد لوازم خانگی، خدمات پس از فروش و راهنمای خرید.',
};

export default async function BlogPage() {
  const data = await serverFetch<{ results: Post[] }>('/posts/');
  const posts = data?.results || [];

  return (
    <section className="container-x py-16 mt-20">
      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted">هنوز مطلبی منتشر نشده است.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => {
            const img = mediaUrl(post.image);
            return (
              <Reveal key={post.id} delay={i * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-3xl border border-line overflow-hidden card-hover"
                >
                  <div className="relative aspect-16/9 bg-surface overflow-hidden">
                    {img ? (
                      <Image
                        src={img}
                        alt={post.title}
                        width={600}
                        height={337}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-line">
                        بدون تصویر
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />{' '}
                        {new Date(post.created_at).toLocaleDateString('fa-IR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {post.author || 'بلانزو'}
                      </span>
                    </div>
                    <h3 className="font-black text-lg line-clamp-2 group-hover:text-brand transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2">{post.excerpt}</p>
                    <span className="mt-3 inline-block text-sm font-bold text-brand">
                      بیشتر بخوانید →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
