import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { serverFetch, mediaUrl } from '@/lib/api';
import type { Post } from '@/lib/types';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetch<Post>(`/posts/${slug}/`);
  if (!post) return { title: 'پست یافت نشد' };
  return {
    title: post.title,
    description: post.excerpt || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;
  const post = await serverFetch<Post>(`/posts/${slug}/`);
  if (!post) notFound();

  const img = mediaUrl(post.image);
  const readingTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <article className="container-x py-12 md:py-20 mt-16 md:mt-20 max-w-4xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors mb-6 group"
      >
        <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
        بازگشت به وبلاگ
      </Link>

      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-ink leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-muted mt-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={16} className="text-brand" />
            {new Date(post.created_at).toLocaleDateString('fa-IR')}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={16} className="text-brand" />
            {post.author || 'بلانزو'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} className="text-brand" />
            {readingTime} دقیقه مطالعه
          </span>
        </div>

        {post.excerpt && (
          <p className="text-base md:text-lg text-muted mt-4 leading-relaxed border-r-4 border-brand pr-4">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Featured Image */}
      {img && (
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 bg-surface shadow-xl">
          <Image src={img} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      )}

      {/* Video */}
      {post.video_url && (
        <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 shadow-xl bg-black">
          <iframe
            src={post.video_url.replace('watch?v=', 'embed/')}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-sm md:prose-lg max-w-none prose-headings:font-black prose-headings:text-ink prose-p:text-muted prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-ul:text-muted prose-li:marker:text-brand"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <footer className="border-t border-line mt-10 md:mt-16 pt-6 md:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted">
            <span className="font-bold text-ink">تاریخ انتشار:</span>{' '}
            {new Date(post.created_at).toLocaleDateString('fa-IR')}
            {post.updated_at !== post.created_at && (
              <span className="text-xs text-muted/60 mr-2">
                (آخرین بروزرسانی: {new Date(post.updated_at).toLocaleDateString('fa-IR')})
              </span>
            )}
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            <ArrowRight size={16} />
            سایر مطالب وبلاگ
          </Link>
        </div>

        {/* Share buttons would go here */}
      </footer>
    </article>
  );
}
