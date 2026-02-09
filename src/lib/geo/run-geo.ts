/**
 * GEO main pipeline (ported from GEO-optim/GEO run_geo.py, utils.py, search_try.py)
 */

import fs from 'node:fs';
import path from 'node:path';
import { callAIChat } from '../ai';
import {
  extractCitationsNew,
  IMPRESSION_FNS,
  ImpressionFnKey,
} from './scoring';
import { GEO_METHODS } from './optimize';
import type { CacheEntry, GeoMethodKey, Source } from './types';

const QUERY_PROMPT = `Write an accurate and concise answer for the given user question, using _only_ the provided summarized web search results. The answer should be correct, high-quality, and written by an expert using an unbiased and journalistic tone. The user's language of choice such as English, Français, Español, Deutsch, or 日本語 should be used. The answer should be informative, interesting, and engaging. The answer's logic and reasoning should be rigorous and defensible. Every sentence in the answer should be _immediately followed_ by an in-line citation to the search result(s). The cited search result(s) should fully support _all_ the information in the sentence. Search results need to be cited using [index]. When citing several search results, use [1][2][3] format rather than [1, 2, 3]. You can use multiple search results to respond comprehensively while avoiding irrelevant search results.

Question: {query}

Search Results:
{source_text}
`;

const CACHE_FILE = process.env.GLOBAL_CACHE_FILE || 'global_cache.json';

function ensureCacheFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, '{}');
    } catch {
      // ignore
    }
  }
}

function readJson(filePath: string): Record<string, CacheEntry[]> {
  ensureCacheFile(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Record<string, CacheEntry[]>;
}

function writeJson(filePath: string, data: Record<string, CacheEntry[]>): void {
  try {
    ensureCacheFile(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch {
    // ignore
  }
}

function cleanSourceText(text: string): string {
  return text
    .trim()
    .replace(/\n\n\n/g, '\n\n')
    .replace(/\n\n/g, ' ')
    .replace(/  /g, ' ')
    .replace(/\t/g, '')
    .replace(/\n/g, '');
}

function segmentSentences(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const SegmenterClass = Intl.Segmenter as typeof Intl.Segmenter;
    const segmenter = new SegmenterClass('en', { granularity: 'sentence' });
    return Array.from(segmenter.segment(text))
      .map(s => s.segment.trim())
      .filter(Boolean);
  }
  const matches = text.match(/[^.!?。！？]+[.!?。！？]*/g);
  return (matches || []).map(s => s.trim()).filter(Boolean);
}

async function cleanSourceGpt35(source: string): Promise<string> {
  let working = source;
  let responseText = '';
  for (let idx = 0; idx < 8; idx++) {
    try {
      const results = await callAIChat(
        [{
          role: 'user',
          content: `Clean and refine the extracted text from a website. Remove any unwanted content such as headers, sidebars, and navigation menus. Retain only the main content of the page and ensure that the text is well-formatted and free of HTML tags, special characters, and any other irrelevant information. Refined text should contain the main intended readable text. Apply markdown formatting when outputting the answer.\n\nHere is the website:\n\\\`\\\`\\\`html_text\n${working.trim()}\\\`\\\`\\\``,
        }],
        { model: 'gpt-3.5-turbo', temperature: 0, maxTokens: 1800, retries: 1 }
      );
      responseText = results[0]?.text?.trim() || '';
      break;
    } catch {
      working = working.slice(0, Math.max(0, working.length - Math.floor(800 * (1 + idx / 2))));
      await new Promise(r => setTimeout(r, 3000 + idx * idx));
    }
  }

  const newLines: string[] = [''];
  for (const line of responseText.split('\n\n')) {
    newLines[newLines.length - 1] += `${line}\n`;
    if (segmentSentences(line).length !== 1) newLines.push('');
  }
  return newLines.map(x => x.trim()).join('\n\n');
}

function summarizeTextIdentity(source: string): string {
  return source.slice(0, 8000);
}

async function searchHandler(query: string, sourceCount = 8): Promise<{ sources: Source[] }> {
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  let html = '';
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { headers });
      html = await res.text();
      break;
    } catch {
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  const links = new Set<string>();
  const linkRegex = /\/url\?q=([^&]+)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const cleaned = decodeURIComponent(match[1]);
      links.add(cleaned);
    } catch {
      // ignore
    }
  }

  const exclude = new Set(['google', 'facebook', 'twitter', 'instagram', 'youtube', 'tiktok', 'quora']);
  const filtered = Array.from(links).filter(link => {
    try {
      const host = new URL(link).hostname;
      const parts = host.split('.');
      if (parts.length < 2) return false;
      return !exclude.has(parts[1]);
    } catch {
      return false;
    }
  });

  const sources: Source[] = [];
  for (const link of filtered) {
    if (sources.length >= sourceCount) break;
    try {
      const res = await fetch(link, { headers });
      const pageHtml = await res.text();
      const titleMatch = pageHtml.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Untitled';
      const htmlText = pageHtml
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
      if (htmlText.length < 400) continue;
      const rawSource = cleanSourceText(htmlText);
      const cleaned = await cleanSourceGpt35(rawSource.slice(0, 8000));
      const summaryText = summarizeTextIdentity(cleaned);
      sources.push({
        url: link,
        text: `Title: ${title}\nSummary:${summaryText}`,
        raw_source: rawSource,
        source: cleaned,
        summary: summaryText,
      });
    } catch {
      continue;
    }
  }

  return { sources };
}

async function generateAnswer(
  query: string,
  sources: string[],
  numCompletions: number,
  temperature = 0.5,
  model = 'gpt-3.5-turbo-16k'
): Promise<string[]> {
  const sourceText = sources
    .map((source, idx) => `### Source ${idx + 1}:\n${source}\n\n\n`)
    .join('\n\n');
  const prompt = QUERY_PROMPT.replace('{query}', query).replace('{source_text}', sourceText);

  const results = await callAIChat(
    [{ role: 'user', content: prompt }],
    { model, temperature, maxTokens: 1024, n: numCompletions, retries: 10, retryDelay: 15000 }
  );
  return results.map(c => `${c.text}\n`);
}

function checkSummariesExist(entries: CacheEntry[], summaries: string[]): CacheEntry | null {
  for (const entry of entries) {
    const s2 = entry.sources.map(s => s.summary);
    if (JSON.stringify(s2) === JSON.stringify(summaries)) return entry;
  }
  return null;
}

async function getAnswer(
  query: string,
  summaries: string[] | null = null,
  n = 5,
  numCompletions = 1,
  cacheIdx = 0,
  regenerateAnswer = false,
  writeToCache = true,
  loadedCache: Record<string, CacheEntry[]> | null = null
): Promise<CacheEntry> {
  const cachePath = path.resolve(process.cwd(), CACHE_FILE);
  const cache = loadedCache ?? readJson(cachePath);

  if (!summaries) {
    if (!cache[query]) {
      const searchResults = await searchHandler(query, n);
      if (!searchResults.sources || searchResults.sources.length === 0) {
        throw new Error('No sources found for query');
      }
      cache[query] = [{ sources: searchResults.sources, responses: [] }];
      if (writeToCache) writeJson(cachePath, cache);
    }
    const searchResults = cache[query][cacheIdx];
    summaries = searchResults.sources.map(s => s.summary);
  }

  if (summaries.length === 0) {
    throw new Error('No summaries available');
  }

  const cachedSource = checkSummariesExist(cache[query], summaries);
  let answers: string[];
  if (!regenerateAnswer && cachedSource) {
    if (cachedSource.responses.length > 0) {
      return cachedSource;
    }
    answers = await generateAnswer(query, summaries, numCompletions);
  } else {
    answers = await generateAnswer(query, summaries, numCompletions);
  }

  if (!cache[query]) {
    cache[query] = [{
      sources: summaries.map(s => ({ summary: s } as Source)),
      responses: [answers],
    }];
  } else {
    let found = false;
    for (const entry of cache[query]) {
      const s2 = entry.sources.map(s => s.summary);
      if (JSON.stringify(s2) === JSON.stringify(summaries)) {
        entry.responses.push(answers);
        found = true;
        break;
      }
    }
    if (!found) {
      cache[query].push({
        sources: summaries.map(s => ({ summary: s } as Source)),
        responses: [answers],
      });
    }
  }

  if (writeToCache) writeJson(cachePath, cache);
  return cache[query][cache[query].length - 1];
}

function meanRows(rows: number[][], cols: number): number[] {
  if (rows.length === 0) return Array.from({ length: cols }, () => Number.NaN);
  const sums = Array.from({ length: cols }, () => 0);
  for (const row of rows) {
    for (let i = 0; i < cols; i++) sums[i] += row[i];
  }
  return sums.map(s => s / rows.length);
}

function isAllZero(row: number[]): boolean {
  return row.every(v => v === 0);
}

export interface ImproveResult {
  initScores: number[];
  improvements: number[][];
  successFlags: boolean[];
  methodNames: GeoMethodKey[];
  answers: string[];
  summaries: string[];
}

export interface ImproveResultFull {
  init_scores: number[][];
  final_scores: number[][][];
}

export interface ImproveResultSimple {
  improvements: number[][];
  success_flags: boolean[];
}

export async function improve(
  query: string,
  idx: number,
  _sources?: string[],
  summaries?: string[],
  impressionFnKey: ImpressionFnKey = 'simple_wordpos',
  returnFullData = false,
  staticCache = process.env.STATIC_CACHE === 'True'
): Promise<ImproveResultSimple | ImproveResultFull> {
  let loadedCache: Record<string, CacheEntry[]> | null = null;
  if (staticCache) {
    const cachePath = path.resolve(process.cwd(), CACHE_FILE);
    loadedCache = readJson(cachePath);
  }

  const answersEntry = await getAnswer(query, summaries ?? null, 5, 5, 0, false, true, loadedCache);
  const answers = answersEntry.responses[answersEntry.responses.length - 1];
  const summariesList = summaries ?? answersEntry.sources.map(s => s.summary);
  if (idx < 0 || idx >= summariesList.length) {
    throw new Error(`idx out of range: ${idx}`);
  }

  const impressionFn = IMPRESSION_FNS[impressionFnKey] as (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => number[];
  let origInitScores: number[][];
  if (
    impressionFnKey === 'subjective_score' ||
    impressionFnKey === 'subjpos_detailed' ||
    impressionFnKey === 'diversity_detailed' ||
    impressionFnKey === 'uniqueness_detailed' ||
    impressionFnKey === 'follow_detailed' ||
    impressionFnKey === 'influence_detailed' ||
    impressionFnKey === 'relevance_detailed' ||
    impressionFnKey === 'subjcount_detailed'
  ) {
    origInitScores = answers
      .map(x => impressionFn(x, query, 5, true, idx))
      .filter(row => !isAllZero(row));
  } else {
    origInitScores = answers.map(x => impressionFn(extractCitationsNew(x), 5, true));
  }

  const initScores = meanRows(origInitScores, 5);
  const improvements: number[][] = [];
  const allFinalScores: number[][][] = [];
  const methodNames = Object.keys(GEO_METHODS) as GeoMethodKey[];

  for (const methodName of methodNames) {
    const summariesCopy = summariesList.slice();
    summariesCopy[idx] = await GEO_METHODS[methodName](summariesCopy[idx]);
    const newAnswersEntry = await getAnswer(query, summariesCopy, 5, 5, 0, false, true, loadedCache);
    const newAnswers = newAnswersEntry.responses[newAnswersEntry.responses.length - 1];

    let finalScoresRows: number[][];
    if (
      impressionFnKey === 'subjective_score' ||
      impressionFnKey === 'subjpos_detailed' ||
      impressionFnKey === 'diversity_detailed' ||
      impressionFnKey === 'uniqueness_detailed' ||
      impressionFnKey === 'follow_detailed' ||
      impressionFnKey === 'influence_detailed' ||
      impressionFnKey === 'relevance_detailed' ||
      impressionFnKey === 'subjcount_detailed'
    ) {
      finalScoresRows = newAnswers
        .map(x => impressionFn(x, query, 5, true, idx))
        .filter(row => !isAllZero(row));
    } else {
      finalScoresRows = newAnswers.map(x => impressionFn(extractCitationsNew(x), 5, true));
    }

    allFinalScores.push(finalScoresRows);
    const finalScores = meanRows(finalScoresRows, 5);
    const delta = finalScores.map((v, i) => v - (initScores[i] ?? 0));
    improvements.push(delta);
  }

  const successFlags = improvements.map(row => (row[idx] ?? 0) > 0);

  if (returnFullData) {
    return {
      init_scores: origInitScores,
      final_scores: allFinalScores,
    };
  }

  return {
    improvements,
    success_flags: successFlags,
  };
}
