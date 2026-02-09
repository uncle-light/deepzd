/**
 * Content Optimization API
 * POST /api/optimize-content
 *
 * Optimizes content using a specific GEO strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizeContent } from '@/lib/geo/optimizer';
import { GeoStrategy } from '@/lib/geo/strategy-analyzer';
import { CONTENT_LIMITS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, strategy, locale = 'zh' } = body;

    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!strategy || !Object.values(GeoStrategy).includes(strategy)) {
      return NextResponse.json(
        { error: 'Valid strategy is required' },
        { status: 400 }
      );
    }

    if (content.length < CONTENT_LIMITS.MIN_LENGTH) {
      return NextResponse.json(
        { error: `Content too short (min ${CONTENT_LIMITS.MIN_LENGTH} characters)` },
        { status: 400 }
      );
    }

    if (content.length > CONTENT_LIMITS.MAX_LENGTH) {
      return NextResponse.json(
        { error: `Content too long (max ${CONTENT_LIMITS.MAX_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Optimize content
    const result = await optimizeContent(content, strategy as GeoStrategy, locale);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Optimization failed' },
      { status: 500 }
    );
  }
}
