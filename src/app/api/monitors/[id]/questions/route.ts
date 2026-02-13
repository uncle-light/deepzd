/**
 * /api/monitors/[id]/questions — GET / POST
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MonitorQuestion, QuestionGroup } from '@/lib/geo/domain/monitor-types';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string }> };

// GET — list questions grouped by coreKeyword
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  // Verify monitor ownership
  const { data: monitor } = await supabase
    .from('brand_monitors')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!monitor) return jsonError('Monitor not found', 404);

  const { data, error } = await supabase
    .from('monitor_questions')
    .select('*')
    .eq('monitor_id', id)
    .eq('user_id', user.id)
    .order('core_keyword')
    .order('sort_order');

  if (error) return jsonError(error.message, 500);

  // Group by coreKeyword
  const groupMap = new Map<string, MonitorQuestion[]>();
  for (const row of data ?? []) {
    const q: MonitorQuestion = {
      id: row.id,
      monitorId: row.monitor_id,
      coreKeyword: row.core_keyword,
      question: row.question,
      intentType: row.intent_type,
      searchVolume: row.search_volume,
      sortOrder: row.sort_order,
      enabled: row.enabled,
    };
    const list = groupMap.get(q.coreKeyword) ?? [];
    list.push(q);
    groupMap.set(q.coreKeyword, list);
  }

  const groups: QuestionGroup[] = Array.from(groupMap.entries()).map(
    ([coreKeyword, questions]) => ({ coreKeyword, questions }),
  );

  return NextResponse.json(groups);
}

// POST — manually add a question
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  // Verify monitor ownership
  const { data: monitor } = await supabase
    .from('brand_monitors')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!monitor) return jsonError('Monitor not found', 404);

  try {
    const body = await request.json();
    const { coreKeyword, question, intentType, searchVolume, sortOrder } = body;

    if (!coreKeyword || !question) {
      return jsonError('coreKeyword and question are required');
    }

    const { data, error } = await supabase
      .from('monitor_questions')
      .insert({
        monitor_id: id,
        user_id: user.id,
        core_keyword: coreKeyword,
        question,
        intent_type: intentType ?? 'recommendation',
        search_volume: searchVolume ?? 0,
        sort_order: sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);

    return NextResponse.json(data, { status: 201 });
  } catch {
    return jsonError('Invalid JSON body');
  }
}
