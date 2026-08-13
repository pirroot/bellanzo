import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import AboutBellanzo from '@/components/home/AboutBellanzo';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyUs from '@/components/home/WhyUs';
import { serverFetch } from '@/lib/api';
import type { Category } from '@/lib/types';

export default async function Home() {
  const cats = (await serverFetch<Category[]>('/categories/')) ?? [];

  return (
    <>
      <Hero />
      <AboutBellanzo />
      <WhyUs />
      <FeaturedProducts />
      <ServicesPreview />
      <Categories cats={cats} />
    </>
  );
}
