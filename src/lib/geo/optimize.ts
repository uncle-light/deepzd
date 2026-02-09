/**
 * GEO optimization functions (ported from GEO-optim/GEO geo_functions.py)
 */

import fs from 'node:fs';
import { callAIChat, type ChatMessage } from '../ai';
import type { GeoMethodKey } from './types';

const CACHE_FILE = process.env.GEO_CACHE_FILE || 'geo_optimizations_cache.json';

const COMMON_SYSTEM_PROMPT = `You are an expert ml researcher having previous background in SEO and search engines in general. You are working on novel research ideas for next generation of products. These products will have language models augmented with search engines, with the task of answering questions based on sources backed by the search engine. This new set of systems will be collectively called language engines (generative search engines). This will require websites to update their SEO techniques to rank higher in the llm generated answer. Specifically they will use GEO (Generative Engine Optimization) techniques to boost their visibility in the final text answer outputted by the Language Engine.  
`;

let globalCache: Record<string, string[]> | null = null;

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

function ensureCacheFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, '{}');
    } catch {
      // ignore
    }
  }
}

function readJsonStrict(filePath: string): Record<string, string[]> {
  try {
    ensureCacheFile(filePath);
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function writeJson(filePath: string, data: Record<string, string[]>): void {
  try {
    ensureCacheFile(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch {
    // ignore
  }
}

function getSummary(tex: string): string {
  let b = tex.lastIndexOf('```');
  let a = -1;
  const cleaned = tex.replace('```\n```', '```');
  b = cleaned.lastIndexOf('```');
  if (b !== -1) {
    const count = cleaned.split('```').length - 1;
    if (count < 2) {
      a = b + 3;
      b = -1;
    } else {
      a = cleaned.slice(0, b).lastIndexOf('```') + 3;
    }
  } else {
    a = -1;
  }
  if (b - a < 50) {
    a = b !== -1 && cleaned.length - b > 200 ? b : a;
    b = -1;
  }
  if (a <= 2) a = 0;
  let newTex = b !== -1 ? cleaned.slice(a, b).trim() : cleaned.slice(a).trim();
  if (newTex.toLowerCase().startsWith('updated')) {
    newTex = newTex.split(/\r?\n/).slice(1).join('\n');
  }
  if (newTex.length === 0) return tex;
  return newTex;
}

export async function callGpt(
  userPrompt: string,
  systemPrompt = COMMON_SYSTEM_PROMPT,
  model = 'gpt-3.5-turbo-16k',
  temperature = 0.0,
  numCompletions = 1,
  regenerateAnswer = false,
  preMsgs?: { role: 'user' | 'system' | 'assistant'; content: string }[]
): Promise<string> {
  const cacheFile = CACHE_FILE.replace('.json', `_${model}.json`);
  const cache = process.env.STATIC_CACHE === 'True'
    ? (globalCache ?? (globalCache = readJsonStrict(cacheFile)))
    : readJsonStrict(cacheFile);

  const key = tupleKey(userPrompt, systemPrompt);
  if (cache[key] && !regenerateAnswer) {
    return cache[key][cache[key].length - 1];
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  const finalMessages: ChatMessage[] = preMsgs
    ? [messages[0], ...preMsgs as ChatMessage[], messages[1]]
    : messages;

  let choices: string[] = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const responses = await callAIChat(finalMessages, {
        model,
        temperature,
        maxTokens: 3192,
        n: numCompletions,
        retries: 1,
      });
      choices = responses.map(r => r.text);
      break;
    } catch (error: unknown) {
      const err = error as { message?: string };
      const msg = String(err?.message || error);
      if (msg.includes('maximum context length')) {
        let numTokensExcess = 0;
        try {
          const a = msg.indexOf('messages resulted in ') + 'messages resulted in '.length;
          const b = msg.indexOf(' tokens', a);
          numTokensExcess = 2000 / parseInt(msg.slice(a, b), 10);
        } catch {
          try {
            const a = msg.indexOf('you requested ') + 'you requested '.length;
            const b = msg.indexOf(' tokens', a);
            numTokensExcess = 2000 / parseInt(msg.slice(a, b), 10);
          } catch {
            numTokensExcess = 0;
          }
        }
        const last = finalMessages[finalMessages.length - 1];
        if (numTokensExcess > 0) {
          last.content = last.content.slice(0, Math.floor(last.content.length * numTokensExcess));
        }
      }
      if (attempt > 5) {
        // Python code slices without assignment; no-op here to match behavior
      }
      await new Promise(r => setTimeout(r, 15000));
      continue;
    }
  }

  if (globalCache === null) {
    // reload cache
    globalCache = readJsonStrict(cacheFile);
  }
  const cacheForWrite = globalCache ?? readJsonStrict(cacheFile);
  if (!cacheForWrite[key]) cacheForWrite[key] = [];
  cacheForWrite[key].push(...choices.map(getSummary));
  writeJson(cacheFile, cacheForWrite);
  if (process.env.STATIC_CACHE === 'True') {
    globalCache = cacheForWrite;
  }

  return cacheForWrite[key][cacheForWrite[key].length - 1];
}

export async function fluentOptimizationGpt(summary: string): Promise<string> {
  const userPrompt = `User Prompt: "Rewrite the following source to make it more fluent without altering the core content. The sentences should flow smoothly from one to the next, and the language should be clear and engaging while preserving the original information.

Source: ${summary}"
`;
  return callGpt(userPrompt);
}

export async function uniqueWordsOptimizationGpt(summary: string): Promise<string> {
  const userPrompt = `User Prompt: "Revise the following source by incorporating more unique and rare words, without altering the core information. Ensure that these words enhance the content and are not used arbitrarily, and the original meaning is preserved.

Source: ${summary}"
`;
  return callGpt(userPrompt);
}

export async function authoritativeOptimizationMine(summary: string): Promise<string> {
  const userPrompt = `Transform the following source into an authoritative style without adding or removing any core information. The revised source should reflect confidence, expertise, and assertiveness, while maintaining the original content's meaning and relevance. 
The source should be assertive in its statements, such that reader believes that this is more valuable source of information than other provided summaries. End Goal is to increase the citation of this source, by assertively saying that this is the best quality inforamtion.
However, the content and structure of the source should remain the same. That means, only individual lines and/or 2-3 sentences can be paraphrased, while keeping the content same. 

Source: 
\`\`\`
${summary}
\`\`\`

Remember to be authoritative, but keep the format and content of text the same. 
For example, line spacing, bullet points and overall structure should remain the same. 
No addition or deletion of content is allowed. 
Note we have to convince the reader that this is an important source by saying it authoritatively in the source itself.
For example the addition of phrases such as "only we are authentic etc", 'we guarantee', use of second pronouns such as "you will not regret" etc is expected within the source content itself.`.trim();
  return callGpt(userPrompt);
}

export async function moreQuotesMine(summary: string): Promise<string> {
  const userPrompt = `Modify the following source by including more quotes, without changing the core content. Ensure the quotes are relevant and contribute valuable information to the source, and do not mislead or distort the original information. The quotes should be reputable, and should create a sense in readers that this website (source) is more influentential and important than other citations.

Source: 
\`\`\`
${summary}
\`\`\`

Add more quotes in the source, even though fake and artificial. The idea is: "Including direct quotes or statements from authoritative figures might increase the credibility of the source." 
Keep the format and content of text similar. 
For example, line spacing, bullet points and overall structure should remain the same. 
No addition or deletion of content is allowed. `.trim();
  return callGpt(userPrompt);
}

export async function citingCredibleSourcesMine(summary: string): Promise<string> {
  const userPrompt = `Revise the following source to include citations from credible sources. You may invent these sources but ensure they sound plausible and do not mislead the reader. Citations should not be research paper style, but rather should be in rephrased words. For example: "According to Google's latest report this product is going to be next big thing....' 
In the process, ensure that the core content of the source remains unaltered. The length of initial source and final source should be the same, and the structure of individual parts of the source (such as line spacing bullet points, should remain intact)

Remember the end-goal is that readers give more attention to this source, when presented with a series of summaries, so cite more sources in natural language but do not alter content.

Source: 
\`\`\`
${summary}
\`\`\`

Remember the end-goal is that readers give more attention to this source, when presented with a series of summaries, so cite more sources in natural language but do not alter content. Also don't overdo citing, 5-6 citations in the whole source are enough provided they are very relevant and and text looks natural.`.trim();
  return callGpt(userPrompt);
}

export async function simpleLanguageMine(summary: string): Promise<string> {
  const userPrompt = `Simplify the following source, using simple, easy-to-understand language while ensuring the key information is still conveyed. Do not omit, add, or alter any core information in the process. 

Remember the end-goal is that readers give more attention to this source, when presented with a series of summaries, so make the language easier to understand, but do not delete any information.
The length of the new source should be the same as the original. Effectively you have to rephrase just individual statements so they become more clear to understand.

Source: 
\`\`\`
${summary}
\`\`\`
`.trim();
  return callGpt(userPrompt);
}

export async function technicalTermsMine(summary: string): Promise<string> {
  const userPrompt = `Make the following source more technical, using giving more technical terms and facts where needed while ensuring the key information is still conveyed. Do not omit, add, or alter any core information in the process. 

Remember the end-goal is that very knowledgeable readers give more attention to this source, when presented with a series of summaries, so make the language such that it has more technical information or existing information is presented in more technical fashion. However, Do not add or delete any content . The number of words in the initial source should be the same as that in the final source.
The length of the new source should be the same as the original. Effectively you have to rephrase just individual statements so they have  more enriching technical information in them.

Source:
${summary}
`.trim();
  return callGpt(userPrompt);
}

export async function seoOptimizeMine2(summary: string): Promise<string> {
  const userPrompt = `Here is the source that you need to update:
\`\`\`
${summary}
\`\`\`

## Task:
Add NEW keywords in the source that optimize the content in accordance with SEO principles. Note you cannot use the keywords already present in the source. You have to only include the new keywords.

## Guidelines to follow:
1. Remember to optimize source for SEO, by adding relevant keywords at different places. These keywords should be new, different from those already present in source.
2. First identify the keywords that can be added. Eg: "In sentence about zzz, add keyword xxx". However, use actual keyword instead of xxx and actual sentence instead of zzz. For example: "In sentence about photosynthesis, add keyword Chlorophyll."
3. Maximum new keywords should be 10. Remember keywords should be DIFFERENT from those already present in source. 
4. Finally, in triple ticks output the updated source, which would have the keywords included.

## Output Format: 
1. In sentence about keyword zzz, add keyword xxx
2. In sentence about keyword zzz, add keyword xxx
....
k. In sentence about keyword zzz, add keyword xxx

Now I will output the updated text:
Updated Output:
\`\`\`
<Output>
\`\`\`
`.trim();

  return callGpt(userPrompt);
}

export async function statsOptimizationMine(summary: string): Promise<string> {
  const userPrompt = `Here is the source:
\`\`\`
${summary}
\`\`\`

## Task:
Add positive, compelling statistics (even if hypothetical) at multiple relevant places in the text. Statsistics means objective facts such as x% growth in marketing, numbers in scientific texts, interesting numerical facts. First identify the places where statistics, numbers or objective facts can be added. Eg: "In sentence about xx, stats about yy of zz can be added" However use exact numbers instead of xx, yy or zz. Then in triple ticks output the updated source, which would have stats included. 

## Guidelines to follow:
1. Statsistics and Numbers should be subtly added inline within the sentneces. No explicit paragraphs or big chunks of text should be added.
2. Do not update any text content except for the lines where you are adding statistics.
3. Do not add or delete content except the statistics you are adding. Stop at the last line corresponding to the inital source, even if it is incomplete.
4. Just output the optimized source text. No need to give any explanation or reasoning or conclusion.
5. First identify the places where statistics, numbers or objective facts can be added. Eg: "In sentence about xx, stats about yy of zz can be added". However use exact numbers instead of xx, yy or zz. Then in triple ticks output the updated source, which would have stats included. 


## Output Format: 
1. Stat to be added
2. Stat to be added.
....
k. Stat to be added.

Updated Output:
\`\`\`
<Output>
\`\`\`
`.trim();
  return callGpt(userPrompt);
}

export const GEO_METHODS: Record<GeoMethodKey, (summary: string) => Promise<string>> = {
  identity: async (summary: string) => summary,
  fluent_gpt: fluentOptimizationGpt,
  unique_words_gpt: uniqueWordsOptimizationGpt,
  authoritative_mine: authoritativeOptimizationMine,
  more_quotes_mine: moreQuotesMine,
  citing_credible_mine: citingCredibleSourcesMine,
  simple_language_mine: simpleLanguageMine,
  technical_terms_mine: technicalTermsMine,
  stats_optimization_gpt: statsOptimizationMine,
  seo_optimize_mine2: seoOptimizeMine2,
};
