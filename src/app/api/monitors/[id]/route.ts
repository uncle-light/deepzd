/**
 * /api/monitors/[id] — GET / PUT / DELETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string }> };

// GET — single monitor + recent checks
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error } = await supabase
    .from('brand_monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return jsonError('Monitor not found', 404);

  // Fetch recent checks
  const { data: checks } = await supabase
    .from('monitor_checks')
    .select('id, status, summary, query_count, engine_count, duration, created_at')
    .eq('monitor_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ ...data, checks: checks ?? [] });
}

// PUT — update monitor config
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.brandNames !== undefined) updates.brand_names = body.brandNames;
    if (body.competitorBrands !== undefined) updates.competitor_brands = body.competitorBrands;
    if (body.industryKeywords !== undefined) updates.industry_keywords = body.industryKeywords;
    if (body.locale !== undefined) updates.locale = body.locale;
    if (body.brandWebsite !== undefined) updates.brand_website = body.brandWebsite;
    if (body.brandDescription !== undefined) updates.brand_description = body.brandDescription;

    if (Object.keys(updates).length === 0) {
      return jsonError('No fields to update');
    }

    const { data, error } = await supabase
      .from('brand_monitors')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError('Monitor not found', 404);

    return NextResponse.json(data);
  } catch {
    return jsonError('Invalid JSON body');
  }
}

// DELETE — delete monitor (cascades to checks)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { error } = await supabase
    .from('brand_monitors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true });
}
