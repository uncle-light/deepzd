/**
 * /api/monitors/[id]/questions/[qid] — PUT / DELETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string; qid: string }> };

// PUT — update a question
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id, qid } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.question !== undefined) updates.question = body.question;
    if (body.intentType !== undefined) updates.intent_type = body.intentType;
    if (body.searchVolume !== undefined) updates.search_volume = body.searchVolume;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    if (body.coreKeyword !== undefined) updates.core_keyword = body.coreKeyword;

    if (Object.keys(updates).length === 0) {
      return jsonError('No fields to update');
    }

    const { data, error } = await supabase
      .from('monitor_questions')
      .update(updates)
      .eq('id', qid)
      .eq('monitor_id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError('Question not found', 404);

    return NextResponse.json(data);
  } catch {
    return jsonError('Invalid JSON body');
  }
}

// DELETE — delete a question
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id, qid } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { error } = await supabase
    .from('monitor_questions')
    .delete()
    .eq('id', qid)
    .eq('monitor_id', id)
    .eq('user_id', user.id);

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true });
}
