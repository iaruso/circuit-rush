import { NextRequest, userAgent } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'it', 'de', 'ru', 'jp', 'zh', 'ar'],
  defaultLocale: 'en',
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { browser } = userAgent(request)
  const supportsWebGPU = browser.name?.toLowerCase() === 'firefox' ? 'false' : 'true'
  response.headers.set('X-Supports-WebGPU', supportsWebGPU)
  return response
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
