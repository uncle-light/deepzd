/**
 * Pure-function brand mention detector.
 * Zero external dependencies — operates on strings only.
 */

import type { BrandMention, CompetitorBrand } from './monitor-types';

// ---------------------------------------------------------------------------
// Brand mention detection
// ---------------------------------------------------------------------------

/**
 * Case-insensitive substring match for any of the brand names.
 */
export function detectBrandMention(
  answer: string,
  brandNames: string[],
): BrandMention {
  const lower = answer.toLowerCase();

  for (const name of brandNames) {
    if (lower.includes(name.toLowerCase())) {
      const position = detectPositionInList(answer, [name]);
      const context = extractMentionContext(answer, [name]);
      return { found: true, position, context, matchedName: name };
    }
  }

  return { found: false, position: 0, context: '', matchedName: '' };
}

// ---------------------------------------------------------------------------
// Position detection in numbered / bulleted lists
// ---------------------------------------------------------------------------

/** Numbered list: "1. Foo" / "1、Foo" / "1) Foo" */
const NUMBERED_RE = /(\d+)[.、)]\s*(.+)/g;
/** Bulleted list: "- Foo" / "• Foo" / "* Foo" */
const BULLETED_RE = /^[-•*]\s*(.+)/gm;

/**
 * Detect the 1-based position of a brand in a list within the answer.
 * Returns 0 if the brand is not found in any list structure.
 */
export function detectPositionInList(
  answer: string,
  brandNames: string[],
): number {
  const lowerNames = brandNames.map((n) => n.toLowerCase());

  // Try numbered lists first
  let match: RegExpExecArray | null;
  NUMBERED_RE.lastIndex = 0;
  while ((match = NUMBERED_RE.exec(answer)) !== null) {
    const rank = parseInt(match[1], 10);
    const text = match[2].toLowerCase();
    if (lowerNames.some((n) => text.includes(n))) {
      return rank;
    }
  }

  // Try bulleted lists (position = order of appearance)
  let idx = 0;
  BULLETED_RE.lastIndex = 0;
  while ((match = BULLETED_RE.exec(answer)) !== null) {
    idx++;
    const text = match[1].toLowerCase();
    if (lowerNames.some((n) => text.includes(n))) {
      return idx;
    }
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Competitor detection
// ---------------------------------------------------------------------------

/**
 * Detect all competitor mentions and their positions.
 */
export function detectCompetitorMentions(
  answer: string,
  competitors: CompetitorBrand[],
): { name: string; position: number }[] {
  const results: { name: string; position: number }[] = [];
  const lower = answer.toLowerCase();

  for (const comp of competitors) {
    const allNames = [comp.name, ...comp.aliases];
    const found = allNames.some((n) => lower.includes(n.toLowerCase()));
    if (found) {
      const position = detectPositionInList(answer, allNames);
      results.push({ name: comp.name, position });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Context extraction
// ---------------------------------------------------------------------------

/**
 * Extract surrounding text (±chars) around the first brand mention.
 */
export function extractMentionContext(
  answer: string,
  brandNames: string[],
  chars = 100,
): string {
  const lower = answer.toLowerCase();

  for (const name of brandNames) {
    const idx = lower.indexOf(name.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - chars);
      const end = Math.min(answer.length, idx + name.length + chars);
      return answer.slice(start, end).trim();
    }
  }

  return '';
}
