/**
 * GEO impression scoring (ported from GEO-optim/GEO utils.py)
 */

import fs from 'node:fs';
import path from 'node:path';

export type CitationSentence = [string[], string, number[]];
export type CitationParagraph = CitationSentence[];
export type CitationDocument = CitationParagraph[];

const CITATION_PATTERN = /\[[^\w\s]*\d+[^\w\s]*\]/g;

function segmentSentences(text: string): string[] {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    return Array.from(segmenter.segment(text))
      .map(s => s.segment.trim())
      .filter(Boolean);
  }
  const matches = text.match(/[^.!?。！？]+[.!?。！？]*/g);
  return (matches || []).map(s => s.trim()).filter(Boolean);
}

function segmentWords(text: string): string[] {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'word' });
    return Array.from(segmenter.segment(text))
      .filter(s => s.isWordLike)
      .map(s => s.segment);
  }
  return (text.match(/[\p{L}\p{N}]+/gu) || []).filter(Boolean);
}

function getNumWords(tokens: string[]): number {
  return tokens.filter(x => x.length > 2).length;
}

function extractCitationsFromSentence(sentence: string): number[] {
  const matches = sentence.match(CITATION_PATTERN) || [];
  return matches
    .map(m => {
      const digits = m.match(/\d+/);
      return digits ? parseInt(digits[0], 10) : NaN;
    })
    .filter(n => !Number.isNaN(n));
}

/**
 * Extract citations from generated answers
 */
export function extractCitationsNew(text: string): CitationDocument {
  const paras = text.split(/\n\n/);
  const sentences = paras.map(p => segmentSentences(p));
  const words: CitationDocument = sentences.map(sentenceList =>
    sentenceList.map(s => [segmentWords(s), s, extractCitationsFromSentence(s)])
  );
  return words;
}

export function impressionWordposCountSimple(
  sentences: CitationDocument,
  n = 5,
  normalize = true
): number[] {
  const flat = sentences.flat();
  const scores = Array.from({ length: n }, () => 0);
  for (let i = 0; i < flat.length; i++) {
    const sent = flat[i];
    for (const cit of sent[2]) {
      let score = getNumWords(sent[0]);
      score *= flat.length > 1 ? Math.exp(-1 * i / (flat.length - 1)) : 1;
      score /= sent[2].length || 1;
      if (scores[cit - 1] === undefined) {
        console.warn(`Citation Hallucinated: ${cit}`);
      } else {
        scores[cit - 1] += score;
      }
    }
  }
  const sum = scores.reduce((a, b) => a + b, 0);
  if (normalize) {
    if (sum !== 0) return scores.map(x => x / sum);
    return Array.from({ length: n }, () => 1 / n);
  }
  return scores;
}

export function impressionWordCountSimple(
  sentences: CitationDocument,
  n = 5,
  normalize = true
): number[] {
  const flat = sentences.flat();
  const scores = Array.from({ length: n }, () => 0);
  for (let i = 0; i < flat.length; i++) {
    const sent = flat[i];
    for (const cit of sent[2]) {
      let score = getNumWords(sent[0]);
      score /= sent[2].length || 1;
      if (scores[cit - 1] === undefined) {
        console.warn(`Citation Hallucinated: ${cit}`);
      } else {
        scores[cit - 1] += score;
      }
    }
  }
  const sum = scores.reduce((a, b) => a + b, 0);
  if (normalize) {
    if (sum !== 0) return scores.map(x => x / sum);
    return Array.from({ length: n }, () => 1 / n);
  }
  return scores;
}

export function impressionPosCountSimple(
  sentences: CitationDocument,
  n = 5,
  normalize = true
): number[] {
  const flat = sentences.flat();
  const scores = Array.from({ length: n }, () => 0);
  for (let i = 0; i < flat.length; i++) {
    const sent = flat[i];
    for (const cit of sent[2]) {
      let score = 1;
      score *= flat.length > 1 ? Math.exp(-1 * i / (flat.length - 1)) : 1;
      score /= sent[2].length || 1;
      if (scores[cit - 1] === undefined) {
        console.warn(`Citation Hallucinated: ${cit}`);
      } else {
        scores[cit - 1] += score;
      }
    }
  }
  const sum = scores.reduce((a, b) => a + b, 0);
  if (normalize) {
    if (sum !== 0) return scores.map(x => x / sum);
    return Array.from({ length: n }, () => 1 / n);
  }
  return scores;
}

interface SubjScoreEntry {
  [idx: string]: Record<string, number>;
}

let subjCacheFile: Record<string, SubjScoreEntry> | null = null;

function pyRepr(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'nan';
    if (!Number.isFinite(value)) return value > 0 ? 'inf' : '-inf';
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) return `[${value.map(pyRepr).join(', ')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${pyRepr(k)}: ${pyRepr(v)}`);
    return `{${entries.join(', ')}}`;
  }
  return String(value);
}

function tupleKey(a: unknown, b: unknown): string {
  return `(${pyRepr(a)}, ${pyRepr(b)})`;
}

function readJson(filePath: string): Record<string, SubjScoreEntry> {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, SubjScoreEntry>;
  } catch {
    return {};
  }
}

function writeJson(filePath: string, data: Record<string, SubjScoreEntry>): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch {
    // ignore
  }
}

export function impressionSubjectiveImpression(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  _normalize = true,
  idx = 0,
  metric = 'subjective_impression'
): number[] {
  function returnableScoreFromScores(scores: Record<string, number>): number[] {
    let avgScore =
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    if (metric !== 'subjective_impression') {
      avgScore = scores[metric] ?? avgScore;
    }
    return Array.from({ length: n }, (_, i) => (i === idx ? avgScore : 0));
  }

  const cacheFile = path.resolve(process.cwd(), 'gpt-eval-scores-cache_new-new.json');
  if (process.env.SUBJ_STATIC_CACHE) {
    if (subjCacheFile === null) subjCacheFile = readJson(cacheFile);
  } else {
    if (fs.existsSync(cacheFile)) {
      subjCacheFile = readJson(cacheFile);
    } else {
      subjCacheFile = {};
      writeJson(cacheFile, subjCacheFile);
    }
  }
  const cache = subjCacheFile || {};
  const cacheKey = tupleKey(sentences, query);
  if (cache[cacheKey] && cache[cacheKey][String(idx)]) {
    return returnableScoreFromScores(cache[cacheKey][String(idx)]);
  }

  // Match GEO behavior: on cache miss, return all zeros.
  return Array.from({ length: n }, () => 0);
}

export function impressionSubjposDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'subjpos_detailed');
}

export function impressionDiversityDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'diversity_detailed');
}

export function impressionUniquenessDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'uniqueness_detailed');
}

export function impressionFollowDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'follow_detailed');
}

export function impressionInfluenceDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'influence_detailed');
}

export function impressionRelevanceDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'relevance_detailed');
}

export function impressionSubjcountDetailed(
  sentences: CitationDocument | string,
  query: string,
  n = 5,
  normalize = true,
  idx = 0
): number[] {
  return impressionSubjectiveImpression(sentences, query, n, normalize, idx, 'subjcount_detailed');
}

export const IMPRESSION_FNS = {
  simple_wordpos: impressionWordposCountSimple,
  simple_word: impressionWordCountSimple,
  simple_pos: impressionPosCountSimple,
  subjective_score: impressionSubjectiveImpression,
  subjpos_detailed: impressionSubjposDetailed,
  diversity_detailed: impressionDiversityDetailed,
  uniqueness_detailed: impressionUniquenessDetailed,
  follow_detailed: impressionFollowDetailed,
  influence_detailed: impressionInfluenceDetailed,
  relevance_detailed: impressionRelevanceDetailed,
  subjcount_detailed: impressionSubjcountDetailed,
};

export type ImpressionFnKey = keyof typeof IMPRESSION_FNS;
