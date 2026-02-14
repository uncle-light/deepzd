/**
 * /api/monitors/[id]/run — POST (SSE streaming check)
 *
 * Follows the same pattern as /api/analyze-content/stream/route.ts:
 * auth → rate limit → quota → create record → SSE stream → persist result
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { checkQuota, incrementUsage } from '@/lib/quota';
import { runBrandMonitorCheck } from '@/lib/geo/application/brand-monitor-check';
import type { BrandMonitor, MonitorQuestion } from '@/lib/geo/domain/monitor-types';
import type { MonitorSSEEvent } from '@/lib/geo/domain/monitor-sse-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT = { limit: 3, windowMs: 60 * 1000 };

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // 1. Rate limit
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`monitor-run:${ip}`, RATE_LIMIT);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } },
    );
  }

  // 2. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Quota check
  try {
    const quota = await checkQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'Quota exceeded', remaining: 0, limit: quota.limit, plan: quota.plan },
        { status: 403 },
      );
    }
  } catch {
    // Quota check failed — allow to proceed
  }

  // 4. Fetch monitor config
  const { data: monitorRow, error: monitorErr } = await supabase
    .from('brand_monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (monitorErr || !monitorRow) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  const monitor: BrandMonitor = {
    id: monitorRow.id,
    userId: monitorRow.user_id,
    name: monitorRow.name,
    brandNames: monitorRow.brand_names,
    competitorBrands: monitorRow.competitor_brands ?? [],
    industryKeywords: monitorRow.industry_keywords,
    brandWebsite: monitorRow.brand_website ?? '',
    brandDescription: monitorRow.brand_description ?? '',
    locale: monitorRow.locale ?? 'zh',
    createdAt: monitorRow.created_at,
    updatedAt: monitorRow.updated_at,
  };

  // 4b. Load pre-configured enabled questions
  const { data: questionRows } = await supabase
    .from('monitor_questions')
    .select('*')
    .eq('monitor_id', id)
    .eq('user_id', user.id)
    .eq('enabled', true)
    .order('core_keyword')
    .order('sort_order');

  const questions: MonitorQuestion[] = (questionRows ?? []).map((r) => ({
    id: r.id,
    monitorId: r.monitor_id,
    coreKeyword: r.core_keyword,
    question: r.question,
    intentType: r.intent_type,
    searchVolume: r.search_volume,
    sortOrder: r.sort_order,
    enabled: r.enabled,
    tags: r.tags ?? [],
  }));

  // 5. Create check record (status=running)
  const { data: checkRow, error: checkErr } = await supabase
    .from('monitor_checks')
    .insert({
      monitor_id: id,
      user_id: user.id,
      status: 'running',
      query_count: 0,
      engine_count: 0,
    })
    .select()
    .single();

  if (checkErr || !checkRow) {
    return NextResponse.json({ error: 'Failed to create check record' }, { status: 500 });
  }

  const checkId = checkRow.id as string;

  // 6. Increment usage
  incrementUsage(user.id).catch((err) => console.error('[monitor-run] incrementUsage:', err));

  // 7. SSE stream
  const encoder = new TextEncoder();
  const signal = request.signal;

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const sendEvent = (event: MonitorSSEEvent) => {
        if (signal?.aborted || closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        if (!closed && !signal?.aborted) {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        }
      }, 15_000);

      const startedAt = Date.now();

      try {
        const { summary, detail } = await runBrandMonitorCheck(monitor, sendEvent, signal, questions);
        const duration = Date.now() - startedAt;

        // 8. Persist result
        await supabase
          .from('monitor_checks')
          .update({
            status: 'completed',
            summary,
            detail,
            query_count: summary.totalQueries,
            engine_count: summary.totalEngines,
            duration,
          })
          .eq('id', checkId);

        sendEvent({
          type: 'monitor_complete',
          timestamp: new Date().toISOString(),
          data: { checkId, summary, detail, duration },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Check failed';

        // Mark check as failed
        try {
          await supabase
            .from('monitor_checks')
            .update({ status: 'failed' })
            .eq('id', checkId);
        } catch {
          // ignore
        }

        sendEvent({
          type: 'monitor_error',
          timestamp: new Date().toISOString(),
          data: { message, code: 'CHECK_ERROR' },
        });
      } finally {
        clearInterval(heartbeat);
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
