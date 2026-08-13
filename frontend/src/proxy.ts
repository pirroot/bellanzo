import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy all /api/ requests to Django backend
  if (pathname.startsWith('/api/')) {
    const url = new URL(pathname, 'http://127.0.0.1:8000');
    return NextResponse.rewrite(url);
  }

  // Always allow: admin, static files, and /services itself
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname === '/services' ||
    pathname.startsWith('/services/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/api/settings/', {
      headers: { 'Cache-Control': 'no-store' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.maintenance_mode) {
        return NextResponse.redirect(new URL('/services', request.url));
      }
    }
  } catch {}

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
