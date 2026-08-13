import type { MetadataRoute } from 'next';

const BASE_URL = 'https://bellanzo-home.ir';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/products',
    '/services',
    '/agencies',
    '/contact',
    '/cart',
    '/checkout',
    '/profile',
    '/profile/orders',
    '/login',
  ];

  const routes = staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
