import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const locales = ['zh', 'en'];
const defaultLocale = 'zh';

// 需要认证保护的路径
const protectedPaths = ['/dashboard', '/analyze', '/history', '/settings'];

// 认证页面路径（已登录则跳转 dashboard）
const authPaths = ['/login', '/register', '/forgot-password'];

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export async function proxy(request: NextRequest) {
  // 1. 先执行 next-intl 中间件处理国际化路由
  const response = handleI18nRouting(request);

  // 2. 创建 Supabase 中间件客户端，检查认证状态
  const { user, response: updatedResponse } = await updateSession(request, response);

  // 3. 从 URL 中提取去掉 locale 前缀后的路径
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = locales.reduce(
    (path, locale) => path.replace(`/${locale}`, ''),
    pathname
  ) || '/';

  // 4. 保护路径检查：未登录 → 重定向到 login
  const isProtected = protectedPaths.some(p => pathnameWithoutLocale.startsWith(p));
  if (isProtected && !user) {
    const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. 认证页面检查：已登录 → 重定向到 dashboard
  const isAuthPage = authPaths.some(p => pathnameWithoutLocale.startsWith(p));
  if (isAuthPage && user) {
    const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale;
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return updatedResponse;
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/((?!api|_next|.*\\..*).*)'],
};
