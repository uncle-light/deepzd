/**
 * /api/monitors/questions-preview — POST
 * Generate question previews without persisting (for create mode).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestionsForKeyword } from '@/lib/geo/infrastructure/monitor-question-generator';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    const body = await request.json();
    const { brandName, coreKeywords, locale } = body as {
      brandName: string;
      coreKeywords: string[];
      locale: string;
    };

    if (!Array.isArray(coreKeywords) || coreKeywords.length === 0) {
      return jsonError('coreKeywords array is required');
    }

    const results: {
      coreKeyword: string;
      question: string;
      intentType: string;
      searchVolume: number;
    }[] = [];

    for (const keyword of coreKeywords.slice(0, 10)) {
      const generated = await generateQuestionsForKeyword(
        brandName || '',
        keyword,
        locale || 'zh',
      );

      for (const q of generated) {
        results.push({
          coreKeyword: keyword,
          question: q.question,
          intentType: q.intentType,
          searchVolume: q.searchVolume,
        });
      }
    }

    return NextResponse.json({ questions: results });
  } catch {
    return jsonError('Invalid JSON body');
  }
}
