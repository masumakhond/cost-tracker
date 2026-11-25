import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/lib/constants';

const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/sw.js',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.webmanifest') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|sw\\.js|manifest\\.webmanifest|manifest\\.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|js)$).*)',
  ],
};
