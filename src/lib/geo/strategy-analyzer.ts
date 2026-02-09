/**
 * GEO Strategy Analyzer
 * Based on GEO-optim/GEO 9 optimization strategies
 *
 * Reference: https://github.com/GEO-optim/GEO
 * Paper: "Generative Engine Optimization" (Princeton, Georgia Tech, Allen AI, IIT Delhi)
 */


/**
 * GEO 9 大优化策略
 */
export enum GeoStrategy {
  CITE_SOURCES = 'cite_sources',           // 1. 添加引用来源
  STATISTICS = 'statistics',               // 2. 使用统计数据
  QUOTATIONS = 'quotations',               // 3. 引用专家观点
  FLUENCY = 'fluency',                     // 4. 提升可读性
  AUTHORITATIVE = 'authoritative',         // 5. 直接回答问题
  TECHNICAL_TERMS = 'technical_terms',     // 6. 结构化内容
  CREDIBILITY = 'credibility',             // 7. 建立权威性
  UNIQUE_WORDS = 'unique_words',           // 8. 保持内容新鲜
  EASY_TO_UNDERSTAND = 'easy_to_understand' // 9. 简化语言
}

/**
 * 策略评分结果
 */
export interface StrategyScore {
  strategy: GeoStrategy;
  score: number; // 0-100
  label: string; // 策略名称
  description: string; // 策略说明
  suggestions: string[]; // 具体优化建议
}

/**
 * 策略分析结果
 */
export interface StrategyAnalysisResult {
  scores: StrategyScore[];
  overallScore: number; // 综合评分
  topStrengths: StrategyScore[]; // 前3个优势
  topWeaknesses: StrategyScore[]; // 前3个弱点
}

/** Locale type for i18n */
type Locale = 'zh' | 'en';

/** Bilingual text pair */
type I18nText = Record<Locale, string>;

/** Get localized text from i18n pair */
function t(text: I18nText, locale: string): string {
  return text[locale as Locale] ?? text.en;
}

/**
 * Strategy i18n dictionary: labels, descriptions, and suggestions
 */
const STRATEGY_I18N: Record<GeoStrategy, {
  label: I18nText;
  description: I18nText;
  suggestions: Record<string, I18nText>;
}> = {
  [GeoStrategy.CITE_SOURCES]: {
    label: { zh: '引用来源', en: 'Cite Sources' },
    description: { zh: '通过引用权威来源提升内容可信度', en: 'Enhance content credibility by citing authoritative sources' },
    suggestions: {
      addMore: { zh: '增加更多引用来源,建议至少 5 处引用', en: 'Add more citations, recommend at least 5 references' },
      few: { zh: '引用来源较少,建议添加权威数据来源和研究引用', en: 'Few citations found, add authoritative data sources and research references' },
      none: { zh: '缺少引用来源!添加学术研究、行业报告或权威网站的引用', en: 'No citations found! Add academic research, industry reports, or authoritative website references' },
    },
  },
  [GeoStrategy.STATISTICS]: {
    label: { zh: '统计数据', en: 'Statistics' },
    description: { zh: '使用数据和统计信息增强说服力', en: 'Use data and statistics to enhance persuasiveness' },
    suggestions: {
      addMore: { zh: '增加更多具体数据和统计信息,使内容更有说服力', en: 'Add more specific data and statistics to make content more persuasive' },
      few: { zh: '统计数据较少,建议添加市场数据、用户数据或研究数据', en: 'Few statistics found, add market data, user data, or research statistics' },
      none: { zh: '缺少统计数据!添加具体数字、百分比、增长率等数据', en: 'No statistics found! Add specific numbers, percentages, growth rates, etc.' },
    },
  },
  [GeoStrategy.QUOTATIONS]: {
    label: { zh: '专家观点', en: 'Quotations' },
    description: { zh: '引用专家观点提升内容权威性', en: 'Quote experts to enhance content authority' },
    suggestions: {
      addMore: { zh: '增加更多专家观点或行业领袖的引用', en: 'Add more expert opinions or industry leader quotes' },
      none: { zh: '添加专家观点、权威人士的引用或行业报告的结论', en: 'Add expert opinions, authoritative quotes, or industry report conclusions' },
    },
  },
  [GeoStrategy.FLUENCY]: {
    label: { zh: '可读性', en: 'Fluency' },
    description: { zh: '提升文本流畅性和可读性', en: 'Improve text fluency and readability' },
    suggestions: {
      longSentences: { zh: '句子过长,建议拆分为更短的句子提升可读性', en: 'Sentences too long, split into shorter sentences for better readability' },
      noStructure: { zh: '增加段落分隔,使内容结构更清晰', en: 'Add paragraph breaks for clearer content structure' },
    },
  },
  [GeoStrategy.AUTHORITATIVE]: {
    label: { zh: '权威性', en: 'Authoritative' },
    description: { zh: '建立权威性,直接回答问题', en: 'Establish authority, answer questions directly' },
    suggestions: {
      improve: { zh: '在开头直接回答核心问题,使用更权威的表述', en: 'Answer core question directly at the beginning, use more authoritative expressions' },
    },
  },
  [GeoStrategy.TECHNICAL_TERMS]: {
    label: { zh: '结构化', en: 'Technical Terms' },
    description: { zh: '使用结构化格式提升内容组织性', en: 'Use structured format to improve content organization' },
    suggestions: {
      improve: { zh: '使用标题、列表、代码块等结构化元素组织内容', en: 'Use headings, lists, code blocks to structure content' },
    },
  },
  [GeoStrategy.CREDIBILITY]: {
    label: { zh: '可信度', en: 'Credibility' },
    description: { zh: '通过时效性和来源提升可信度', en: 'Enhance credibility through timeliness and sources' },
    suggestions: {
      improve: { zh: '添加链接、时间标记和最新信息来提升可信度', en: 'Add links, timestamps, and recent information to enhance credibility' },
    },
  },
  [GeoStrategy.UNIQUE_WORDS]: {
    label: { zh: '内容新鲜度', en: 'Unique Words' },
    description: { zh: '保持内容新鲜度和词汇多样性', en: 'Maintain content freshness and vocabulary diversity' },
    suggestions: {
      improve: { zh: '增加词汇多样性,避免重复使用相同词汇', en: 'Increase vocabulary diversity, avoid repeating same words' },
    },
  },
  [GeoStrategy.EASY_TO_UNDERSTAND]: {
    label: { zh: '易理解性', en: 'Easy to Understand' },
    description: { zh: '简化语言,提升内容易理解性', en: 'Simplify language, improve content comprehensibility' },
    suggestions: {
      simplify: { zh: '简化句子结构,使用更简单的表达方式', en: 'Simplify sentence structure, use simpler expressions' },
      addExamples: { zh: '添加例子和解释,帮助读者理解复杂概念', en: 'Add examples and explanations to help readers understand complex concepts' },
    },
  },
};

/**
 * 分析策略 1: 引用来源 (Cite Sources)
 * 检查内容是否包含引用、参考文献、数据来源
 */
function analyzeCiteSources(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 0;

  // 检测引用标记: [1], [2], (Smith, 2023), 等
  const citationPatterns = [
    /\[\d+\]/g,                    // [1], [2]
    /\([A-Z][a-z]+,?\s+\d{4}\)/g,  // (Smith, 2023)
    /根据.*研究/g,                  // 根据...研究
    /数据显示/g,                    // 数据显示
    /来源[:：]/g,                   // 来源:
  ];

  let citationCount = 0;
  citationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) citationCount += matches.length;
  });

  const i18n = STRATEGY_I18N[GeoStrategy.CITE_SOURCES];

  // 评分逻辑
  if (citationCount >= 5) {
    score = 90;
  } else if (citationCount >= 3) {
    score = 70;
    suggestions.push(t(i18n.suggestions.addMore, locale));
  } else if (citationCount >= 1) {
    score = 50;
    suggestions.push(t(i18n.suggestions.few, locale));
  } else {
    score = 20;
    suggestions.push(t(i18n.suggestions.none, locale));
  }

  return {
    strategy: GeoStrategy.CITE_SOURCES,
    score,
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 2: 统计数据 (Statistics)
 * 检查内容是否包含数字、百分比、统计数据
 */
function analyzeStatistics(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 0;

  // 检测统计数据模式
  const statsPatterns = [
    /\d+%/g,                        // 百分比: 30%, 50%
    /\d+\s*亿/g,                    // 大数字: 10亿
    /\d+\s*万/g,                    // 万: 5万
    /\d+\s*(倍|次|个|人|家)/g,      // 数量单位
    /增长\s*\d+/g,                  // 增长数据
    /\d+\.\d+/g,                    // 小数: 3.5, 24.7
  ];

  let statsCount = 0;
  statsPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) statsCount += matches.length;
  });

  const i18n = STRATEGY_I18N[GeoStrategy.STATISTICS];

  // 评分逻辑
  if (statsCount >= 8) {
    score = 95;
  } else if (statsCount >= 5) {
    score = 80;
  } else if (statsCount >= 3) {
    score = 60;
    suggestions.push(t(i18n.suggestions.addMore, locale));
  } else if (statsCount >= 1) {
    score = 40;
    suggestions.push(t(i18n.suggestions.few, locale));
  } else {
    score = 15;
    suggestions.push(t(i18n.suggestions.none, locale));
  }

  return {
    strategy: GeoStrategy.STATISTICS,
    score,
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}
/**
 * 分析策略 3: 专家观点 (Quotations)
 */
function analyzeQuotations(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 0;

  const quotePatterns = [
    /[""].*?[""]|「.*?」/g,
    /.*?表示|.*?认为|.*?指出/g,
    /根据.*?(专家|教授|CEO|创始人)/g,
  ];

  let quoteCount = 0;
  quotePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) quoteCount += matches.length;
  });

  const i18n = STRATEGY_I18N[GeoStrategy.QUOTATIONS];

  if (quoteCount >= 3) {
    score = 85;
  } else if (quoteCount >= 2) {
    score = 70;
  } else if (quoteCount >= 1) {
    score = 50;
    suggestions.push(t(i18n.suggestions.addMore, locale));
  } else {
    score = 25;
    suggestions.push(t(i18n.suggestions.none, locale));
  }

  return {
    strategy: GeoStrategy.QUOTATIONS,
    score,
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 4: 可读性 (Fluency)
 */
function analyzeFluency(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 70; // 默认中等分数

  const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = content.length / sentences.length;

  // 检查段落结构
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const hasGoodStructure = paragraphs.length >= 3;

  const i18n = STRATEGY_I18N[GeoStrategy.FLUENCY];

  if (avgSentenceLength > 100) {
    score -= 20;
    suggestions.push(t(i18n.suggestions.longSentences, locale));
  }

  if (!hasGoodStructure) {
    score -= 15;
    suggestions.push(t(i18n.suggestions.noStructure, locale));
  }

  return {
    strategy: GeoStrategy.FLUENCY,
    score: Math.max(score, 30),
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 5: 权威性 (Authoritative)
 */
function analyzeAuthoritative(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 60;

  // 检查是否直接回答问题
  const hasDirectAnswer = /^(.*?是|.*?指|.*?表示|.*?means|.*?refers to)/m.test(content);
  
  // 检查权威性词汇
  const authPatterns = [
    /研究表明|数据显示|事实上|实际上/g,
    /research shows|studies indicate|in fact/gi,
  ];

  let authCount = 0;
  authPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) authCount += matches.length;
  });

  if (hasDirectAnswer) score += 20;
  if (authCount >= 3) score += 15;
  else if (authCount >= 1) score += 5;

  const i18n = STRATEGY_I18N[GeoStrategy.AUTHORITATIVE];

  if (score < 70) {
    suggestions.push(t(i18n.suggestions.improve, locale));
  }

  return {
    strategy: GeoStrategy.AUTHORITATIVE,
    score: Math.min(score, 95),
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 6: 结构化内容 (Technical Terms)
 */
function analyzeTechnicalTerms(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 50;

  // 检查结构化元素
  const hasHeadings = /^#{1,6}\s+/m.test(content) || /^[一二三四五六七八九十]+[、.]/m.test(content);
  const hasList = /^[-*•]\s+/m.test(content) || /^\d+[.)]\s+/m.test(content);
  const hasCodeBlock = /```[\s\S]*?```/.test(content);

  if (hasHeadings) score += 20;
  if (hasList) score += 20;
  if (hasCodeBlock) score += 10;

  const i18n = STRATEGY_I18N[GeoStrategy.TECHNICAL_TERMS];

  if (score < 70) {
    suggestions.push(t(i18n.suggestions.improve, locale));
  }

  return {
    strategy: GeoStrategy.TECHNICAL_TERMS,
    score: Math.min(score, 95),
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 7: 可信度 (Credibility)
 */
function analyzeCredibility(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 50;

  // 检查可信度指标
  const credPatterns = [
    /https?:\/\/[^\s]+/g,  // URL链接
    /\d{4}年/g,            // 年份
    /最新|最近|近期/g,      // 时效性
  ];

  let credCount = 0;
  credPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) credCount += matches.length;
  });

  if (credCount >= 5) score = 85;
  else if (credCount >= 3) score = 70;
  else if (credCount >= 1) score = 55;

  const i18n = STRATEGY_I18N[GeoStrategy.CREDIBILITY];

  if (score < 70) {
    suggestions.push(t(i18n.suggestions.improve, locale));
  }

  return {
    strategy: GeoStrategy.CREDIBILITY,
    score,
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析策略 8: 内容新鲜度 (Unique Words)
 */
function analyzeUniqueWords(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 60;

  // 计算词汇多样性
  const words = content.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;

  if (diversity > 0.6) score = 90;
  else if (diversity > 0.5) score = 75;
  else if (diversity > 0.4) score = 60;
  else {
    score = 40;
    suggestions.push(t(STRATEGY_I18N[GeoStrategy.UNIQUE_WORDS].suggestions.improve, locale));
  }

  return {
    strategy: GeoStrategy.UNIQUE_WORDS,
    score,
    label: t(STRATEGY_I18N[GeoStrategy.UNIQUE_WORDS].label, locale),
    description: t(STRATEGY_I18N[GeoStrategy.UNIQUE_WORDS].description, locale),
    suggestions
  };
}

/**
 * 分析策略 9: 易理解性 (Easy to Understand)
 */
function analyzeEasyToUnderstand(content: string, locale: string): StrategyScore {
  const suggestions: string[] = [];
  let score = 70;

  // 检查复杂度指标
  const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = content.length / sentences.length;
  
  // 检查是否有解释性内容
  const hasExplanation = /例如|比如|也就是说|换句话说|for example|in other words/gi.test(content);

  const i18n = STRATEGY_I18N[GeoStrategy.EASY_TO_UNDERSTAND];

  if (avgSentenceLength > 80) {
    score -= 15;
    suggestions.push(t(i18n.suggestions.simplify, locale));
  }

  if (!hasExplanation) {
    score -= 10;
    suggestions.push(t(i18n.suggestions.addExamples, locale));
  }

  return {
    strategy: GeoStrategy.EASY_TO_UNDERSTAND,
    score: Math.max(score, 40),
    label: t(i18n.label, locale),
    description: t(i18n.description, locale),
    suggestions
  };
}

/**
 * 分析用户内容的 GEO 9 大策略表现
 */
export function analyzeGeoStrategies(
  content: string,
  locale: string = 'zh'
): StrategyAnalysisResult {
  // 执行所有策略分析
  const scores: StrategyScore[] = [
    analyzeCiteSources(content, locale),
    analyzeStatistics(content, locale),
    analyzeQuotations(content, locale),
    analyzeFluency(content, locale),
    analyzeAuthoritative(content, locale),
    analyzeTechnicalTerms(content, locale),
    analyzeCredibility(content, locale),
    analyzeUniqueWords(content, locale),
    analyzeEasyToUnderstand(content, locale),
  ];

  // 计算综合评分
  const overallScore = Math.round(
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  );

  // 找出前3个优势和弱点
  const sortedByScore = [...scores].sort((a, b) => b.score - a.score);
  const topStrengths = sortedByScore.slice(0, 3);
  const topWeaknesses = sortedByScore.slice(-3).reverse();

  return {
    scores,
    overallScore,
    topStrengths,
    topWeaknesses,
  };
}
