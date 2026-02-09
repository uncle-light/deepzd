import createMiddleware from 'next-intl/middleware';
import {NextRequest} from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed'
});

export function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/((?!api|_next|.*\\..*).*)']
};
