/**
 * /api/monitors/[id]/questions/generate — POST
 * AI batch-generate questions for given core keywords.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestionsForKeyword } from '@/lib/geo/infrastructure/monitor-question-generator';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  // Verify monitor ownership and get brand name
  const { data: monitor } = await supabase
    .from('brand_monitors')
    .select('id, brand_names, locale')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!monitor) return jsonError('Monitor not found', 404);

  try {
    const body = await request.json();
    const { coreKeywords } = body as { coreKeywords: string[] };

    if (!Array.isArray(coreKeywords) || coreKeywords.length === 0) {
      return jsonError('coreKeywords array is required');
    }

    const brandName = monitor.brand_names[0] ?? '';
    const locale = monitor.locale ?? 'zh';
    const allInserted: Record<string, unknown>[] = [];

    for (const keyword of coreKeywords.slice(0, 10)) {
      const generated = await generateQuestionsForKeyword(brandName, keyword, locale);

      if (generated.length === 0) continue;

      const rows = generated.map((q, idx) => ({
        monitor_id: id,
        user_id: user.id,
        core_keyword: keyword,
        question: q.question,
        intent_type: q.intentType,
        search_volume: q.searchVolume,
        sort_order: idx,
      }));

      const { data, error } = await supabase
        .from('monitor_questions')
        .insert(rows)
        .select();

      if (!error && data) {
        allInserted.push(...data);
      }
    }

    return NextResponse.json({ inserted: allInserted.length, questions: allInserted }, { status: 201 });
  } catch {
    return jsonError('Invalid JSON body');
  }
}
