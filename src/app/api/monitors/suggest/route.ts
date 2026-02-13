/**
 * /api/monitors/suggest — POST
 * Given brand names, use LLM to suggest competitors and industry keywords.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIChat, getDefaultProvider } from '@/lib/ai';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface SuggestResult {
  competitors: { name: string; aliases: string[] }[];
  keywords: string[];
}

function buildPrompt(brandNames: string[], locale: string): string {
  if (locale === 'zh') {
    return `你是一个品牌竞争分析专家。根据以下品牌名称，分析该品牌所在的行业，然后：
1. 列出 3-5 个主要竞争品牌（含别名/域名）
2. 列出 5-8 个该行业的核心关键词（用户会搜索的词）

品牌名称：${brandNames.join('、')}

严格按以下 JSON 格式返回，不要添加其他内容：
{"competitors":[{"name":"竞品名","aliases":["别名1","域名"]}],"keywords":["关键词1","关键词2"]}`;
  }

  return `You are a brand competitive analysis expert. Based on the following brand names, analyze the industry and then:
1. List 3-5 main competitor brands (with aliases/domains)
2. List 5-8 core industry keywords that users would search for

Brand names: ${brandNames.join(', ')}

Return strictly in this JSON format, no extra text:
{"competitors":[{"name":"Competitor","aliases":["alias1","domain.com"]}],"keywords":["keyword1","keyword2"]}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { brandNames, locale = 'zh' } = body as { brandNames: string[]; locale: string };

  if (!brandNames || brandNames.length === 0) {
    return jsonError('Brand names required');
  }

  try {
    const provider = getDefaultProvider();
    const prompt = buildPrompt(brandNames, locale);

    const responses = await callAIChat(
      [{ role: 'user', content: prompt }],
      { provider: provider as import('@/lib/ai').AIProvider, temperature: 0.7 },
    );

    const text = responses[0]?.text ?? '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid LLM response');
    }

    const result: SuggestResult = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(result.competitors) || !Array.isArray(result.keywords)) {
      throw new Error('Invalid response structure');
    }

    return NextResponse.json({
      competitors: result.competitors.slice(0, 5).map((c) => ({
        name: String(c.name || ''),
        aliases: Array.isArray(c.aliases) ? c.aliases.map(String) : [],
      })),
      keywords: result.keywords.slice(0, 8).map(String),
    });
  } catch {
    // Fallback: return empty suggestions
    return NextResponse.json({ competitors: [], keywords: [] });
  }
}
