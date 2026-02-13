/**
 * /api/monitors — GET (list) / POST (create)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET — list all monitors for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error } = await supabase
    .from('brand_monitors')
    .select('*, monitor_checks(id, status, summary, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return jsonError(error.message, 500);

  // Attach latest check to each monitor
  const monitors = (data ?? []).map((m) => {
    const checks = (m.monitor_checks as { id: string; status: string; summary: unknown; created_at: string }[]) ?? [];
    const sorted = checks.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const latestCheck = sorted[0] ?? null;
    const { monitor_checks: _, ...rest } = m;
    return { ...rest, latestCheck };
  });

  return NextResponse.json(monitors);
}

// POST — create a new monitor
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    const body = await request.json();
    const { name, brandNames, competitorBrands, industryKeywords, locale, brandWebsite, brandDescription } = body;

    if (!name || !brandNames?.length || !industryKeywords?.length) {
      return jsonError('name, brandNames, and industryKeywords are required');
    }

    const { data, error } = await supabase
      .from('brand_monitors')
      .insert({
        user_id: user.id,
        name,
        brand_names: brandNames,
        competitor_brands: competitorBrands ?? [],
        industry_keywords: industryKeywords,
        locale: locale ?? 'zh',
        brand_website: brandWebsite ?? '',
        brand_description: brandDescription ?? '',
      })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);

    return NextResponse.json(data, { status: 201 });
  } catch {
    return jsonError('Invalid JSON body');
  }
}
