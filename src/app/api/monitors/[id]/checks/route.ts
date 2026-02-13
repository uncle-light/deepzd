/**
 * /api/monitors/[id]/checks — GET (paginated check history)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));

  const { data, error, count } = await supabase
    .from('monitor_checks')
    .select('id, status, summary, query_count, engine_count, duration, created_at', { count: 'exact' })
    .eq('monitor_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    checks: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
