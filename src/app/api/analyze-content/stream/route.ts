/**
 * SSE streaming API for content analysis
 * POST /api/analyze-content/stream
 * GET is kept for backward compatibility
 */

import { NextRequest } from 'next/server';
import { analyzeContentGeoStream, fetchUrlContent } from '@/lib/geo/content-analyzer';
import type { SSEEvent } from '@/lib/geo/sse-types';
import { CONTENT_LIMITS } from '@/lib/constants';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type InputType = 'text' | 'url';

interface StreamRequestPayload {
  content?: string;
  locale?: string;
  inputType?: string;
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildSseResponse(content: string, locale: string): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SSEEvent) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        await analyzeContentGeoStream(content, locale, sendEvent);
      } catch (error) {
        sendEvent({
          type: 'error',
          timestamp: new Date().toISOString(),
          data: {
            message: error instanceof Error ? error.message : 'Analysis failed',
            code: 'STREAM_ERROR',
          },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function normalizeContent(rawContent: string, inputType: InputType): Promise<string> {
  if (inputType === 'url') {
    return fetchUrlContent(rawContent);
  }
  return rawContent;
}

async function handleStreamRequest(payload: StreamRequestPayload): Promise<Response> {
  const inputType = payload.inputType || 'text';
  if (inputType !== 'text' && inputType !== 'url') {
    return jsonError('inputType must be text or url');
  }

  const locale = payload.locale || 'zh';
  const rawContent = payload.content || '';

  if (!rawContent.trim()) {
    return jsonError('content is required');
  }

  let content = '';
  try {
    content = (await normalizeContent(rawContent, inputType)).trim();
  } catch {
    return jsonError('Invalid URL or failed to fetch content');
  }

  if (content.length < CONTENT_LIMITS.MIN_LENGTH) {
    return jsonError(`Content too short (minimum ${CONTENT_LIMITS.MIN_LENGTH} characters)`);
  }

  if (content.length > CONTENT_LIMITS.MAX_LENGTH) {
    return jsonError(`Content too long (maximum ${CONTENT_LIMITS.MAX_LENGTH} characters)`);
  }

  return buildSseResponse(content, locale);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`analyze:${ip}`, RATE_LIMITS.analyze);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateCheck.retryAfterSeconds),
      },
    });
  }

  try {
    const payload = (await request.json()) as StreamRequestPayload;
    return handleStreamRequest(payload);
  } catch {
    return jsonError('Invalid JSON body');
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`analyze:${ip}`, RATE_LIMITS.analyze);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateCheck.retryAfterSeconds),
      },
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const payload: StreamRequestPayload = {
    content: searchParams.get('content') || '',
    locale: searchParams.get('locale') || 'zh',
    inputType: searchParams.get('inputType') || 'text',
  };
  return handleStreamRequest(payload);
}
