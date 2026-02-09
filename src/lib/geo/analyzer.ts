/**
 * GEO analyzer (aligned with GEO-optim/GEO)
 */

import type { AnalyzeRequest, ImproveResult } from './types';
import { improve } from './run-geo';

export async function analyze(request: AnalyzeRequest): Promise<ImproveResult> {
  const { query, idx, sources, summaries, impression_fn, return_full_data, static_cache } = request;

  if (!query || typeof query !== 'string') {
    throw new Error('query is required');
  }
  if (typeof idx !== 'number' || Number.isNaN(idx)) {
    throw new Error('idx is required');
  }

  const result = await improve(
    query,
    idx,
    sources,
    summaries,
    impression_fn || 'simple_wordpos',
    !!return_full_data,
    static_cache ?? (process.env.STATIC_CACHE === 'True')
  );
  return result as ImproveResult;
}

export * from './types';
