import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_deepzd_db_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_deepzd_db_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 使用 getUser() 而非 getSession()，确保 JWT 经过 Supabase 验证
  const { data: { user } } = await supabase.auth.getUser();

  return { user, response };
}
