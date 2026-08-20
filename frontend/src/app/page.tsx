import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import AboutBellanzo from '@/components/home/AboutBellanzo';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyUs from '@/components/home/WhyUs';
import NewProducts from '@/components/home/NewProducts';
import { serverFetch } from '@/lib/api';
import type { Category, Post, Product } from '@/lib/types';
import BlogPreview from '@/components/home/BlogPreview';

export const metadata: Metadata = {
  title: 'خانه',
  description: 'بهترین محصولات لوازم خانگی با گارانتی معتبر و خدمات پس از فروش حرفه‌ای',
};

export default async function Home() {
  const [cats, newProducts, blogPosts] = await Promise.all([
    serverFetch<Category[]>('/categories/'),
    serverFetch<{ results: Product[] }>('/products/?ordering=-created_at&limit=8'),
    serverFetch<{ results: Post[] }>('/posts/?limit=4'),
  ]);

  return (
    <>
      <Hero />
      <AboutBellanzo />
      <WhyUs />
      <NewProducts products={newProducts?.results || []} />
      <FeaturedProducts />
      <ServicesPreview />
      <Categories cats={cats ?? []} />
      <BlogPreview posts={blogPosts?.results || []} />
    </>
  );
}
