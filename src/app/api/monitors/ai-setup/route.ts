/**
 * /api/monitors/ai-setup — POST
 * One-click AI generation: given brand names, generate website, description,
 * competitors, core keywords, and questions.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAIChat, getDefaultProvider } from "@/lib/ai";
import type { AIProvider } from "@/lib/ai";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface AISetupResult {
  brandNames: string[];
  website: string;
  description: string;
  competitors: { name: string; aliases: string[] }[];
  coreKeywords: string[];
  questions: { coreKeyword: string; question: string; intentType: string; searchVolume: number }[];
}

function buildPrompt(brandName: string, locale: string): string {
  if (locale === "zh") {
    return `你是一个品牌竞争分析和 AI 搜索优化专家。根据以下品牌名称，完成全面的品牌分析：

品牌名称：${brandName}

请生成以下信息：
1. brandNames: 该品牌的所有常见名称和别名（包括中文名、英文名、缩写、常见简称等），3-5 个
2. website: 该品牌的官方网站 URL（如果不确定，返回空字符串）
3. description: 一段简短的品牌描述（50-100字）
4. competitors: 3-5 个主要竞争品牌，每个包含名称和别名
5. coreKeywords: 5-8 个该行业的核心产品/服务关键词（用户会搜索的品类词，不要包含任何品牌名）
6. questions: 针对每个核心关键词，生成 2-3 个用户可能向 AI 搜索引擎提问的**通用行业问题**

⚠️ 问题生成的关键规则：
- 问题必须是通用的行业/品类问题，不能包含任何品牌名称
- 问题应该是用户在寻求推荐、对比或了解某个品类时会问的问题
- 好的问题示例："哪款精华液抗老效果最好？"、"2024年面霜排行榜前十名"、"敏感肌适合用什么洗面奶？"
- 坏的问题示例（禁止）："${brandName}的精华液怎么样？"、"${brandName}和XX哪个好？"
- 这些问题的目的是：监控品牌在 AI 回答这些通用问题时是否被提及和推荐

每个问题标注意图类型（recommendation=推荐建议、comparison=对比评测、inquiry=咨询查询）和预估月搜索量

严格按以下 JSON 格式返回，不要添加其他内容：
{
  "brandNames": ["品牌名", "English Name", "缩写"],
  "website": "https://example.com",
  "description": "品牌描述",
  "competitors": [{"name": "竞品名", "aliases": ["别名1"]}],
  "coreKeywords": ["品类词1", "品类词2"],
  "questions": [
    {"coreKeyword": "品类词1", "question": "通用行业问题", "intentType": "recommendation", "searchVolume": 1000},
    {"coreKeyword": "品类词1", "question": "通用行业问题", "intentType": "comparison", "searchVolume": 800}
  ]
}`;
  }

  return `You are a brand competitive analysis and AI search optimization expert. Based on the following brand name, perform a comprehensive brand analysis:

Brand name: ${brandName}

Generate the following:
1. brandNames: All common names and aliases for this brand (including local name, English name, abbreviations, common short forms), 3-5 items
2. website: The brand's official website URL (empty string if unsure)
3. description: A brief brand description (50-100 words)
4. competitors: 3-5 main competitor brands, each with name and aliases
5. coreKeywords: 5-8 core product/service category keywords for this industry (generic category terms users would search, do NOT include any brand names)
6. questions: For each core keyword, generate 2-3 **generic industry questions** users might ask AI search engines

⚠️ Critical rules for question generation:
- Questions MUST be generic industry/category questions, NEVER include any brand names
- Questions should reflect what users ask when seeking recommendations, comparisons, or information about a product category
- Good examples: "What's the best anti-aging serum?", "Top 10 moisturizers for dry skin", "Which running shoes are best for marathon training?"
- Bad examples (FORBIDDEN): "Is ${brandName} good?", "How does ${brandName} compare to X?"
- Purpose: monitor whether the brand gets mentioned when AI answers these generic questions

Each question should have intent type (recommendation, comparison, inquiry) and estimated monthly search volume

Return strictly in this JSON format, no extra text:
{
  "brandNames": ["Brand Name", "Alias", "Abbreviation"],
  "website": "https://example.com",
  "description": "Brand description",
  "competitors": [{"name": "Competitor", "aliases": ["alias1"]}],
  "coreKeywords": ["category1", "category2"],
  "questions": [
    {"coreKeyword": "category1", "question": "Generic industry question", "intentType": "recommendation", "searchVolume": 1000},
    {"coreKeyword": "category1", "question": "Generic industry question", "intentType": "comparison", "searchVolume": 800}
  ]
}`;
}

const VALID_INTENTS = new Set(["recommendation", "comparison", "inquiry"]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json();
  const { brandName, locale = "zh" } = body as {
    brandName: string;
    locale: string;
  };

  if (!brandName || !brandName.trim()) {
    return jsonError("Brand name required");
  }

  try {
    const provider = getDefaultProvider();
    const prompt = buildPrompt(brandName.trim(), locale);

    const responses = await callAIChat(
      [{ role: "user", content: prompt }],
      { provider: provider as AIProvider, temperature: 0.7 },
    );

    const text = responses[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid LLM response");

    const raw = JSON.parse(jsonMatch[0]) as AISetupResult;

    // Validate and sanitize
    const result: AISetupResult = {
      brandNames: Array.isArray(raw.brandNames)
        ? raw.brandNames.slice(0, 5).map(String).filter(Boolean)
        : [],
      website: typeof raw.website === "string" ? raw.website.trim() : "",
      description: typeof raw.description === "string" ? raw.description.trim() : "",
      competitors: Array.isArray(raw.competitors)
        ? raw.competitors.slice(0, 5).map((c) => ({
            name: String(c.name || ""),
            aliases: Array.isArray(c.aliases) ? c.aliases.map(String) : [],
          }))
        : [],
      coreKeywords: Array.isArray(raw.coreKeywords)
        ? raw.coreKeywords.slice(0, 8).map(String)
        : [],
      questions: Array.isArray(raw.questions)
        ? raw.questions.map((q) => ({
            coreKeyword: String(q.coreKeyword || ""),
            question: String(q.question || ""),
            intentType: VALID_INTENTS.has(q.intentType) ? q.intentType : "recommendation",
            searchVolume: typeof q.searchVolume === "number" ? q.searchVolume : 0,
          }))
        : [],
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      brandNames: [],
      website: "",
      description: "",
      competitors: [],
      coreKeywords: [],
      questions: [],
    });
  }
}
