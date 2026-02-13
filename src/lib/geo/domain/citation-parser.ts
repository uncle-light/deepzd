/**
 * Citation parser for real AI search verification
 * Extracts citations from AI search engine responses (annotations + inline URLs)
 */

import type { WebSearchAnnotation } from '../../ai';
import type { DiscoveredCitation } from './verification-types';

/**
 * Extract domain from URL, stripping www. prefix
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Check if a citation domain matches the user's domain
 * Handles www prefix and subdomain matching
 */
export function isDomainMatch(citationDomain: string, userDomain: string): boolean {
  const normalize = (d: string) => d.toLowerCase().replace(/^www\./, '');
  const a = normalize(citationDomain);
  const b = normalize(userDomain);

  if (!a || !b) return false;

  // Exact match
  if (a === b) return true;

  // Subdomain match: citation "blog.example.com" matches user "example.com"
  if (a.endsWith(`.${b}`)) return true;

  return false;
}

/**
 * Parse citations from WebSearchAnnotation array
 * Used for structured annotation responses (volc, glm, openai)
 */
export function parseCitationsFromAnnotations(
  annotations: WebSearchAnnotation[],
  userDomain: string
): DiscoveredCitation[] {
  const citations: DiscoveredCitation[] = [];

  for (const ann of annotations) {
    if (!ann.url) continue;

    const domain = extractDomain(ann.url);
    if (!domain) continue;

    citations.push({
      url: ann.url,
      title: ann.title,
      domain,
      isUserDomain: isDomainMatch(domain, userDomain),
    });
  }

  return citations;
}

/**
 * Parse citations from plain text (extract inline URLs)
 * Fallback for engines that don't return structured annotations
 */
export function parseCitationsFromText(
  text: string,
  userDomain: string
): DiscoveredCitation[] {
  const urlRegex = /https?:\/\/[^\s\])<>"']+/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  const citations: DiscoveredCitation[] = [];

  for (const url of matches) {
    // Clean trailing punctuation
    const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
    const domain = extractDomain(cleanUrl);
    if (!domain) continue;

    citations.push({
      url: cleanUrl,
      domain,
      isUserDomain: isDomainMatch(domain, userDomain),
    });
  }

  return citations;
}

/**
 * Deduplicate citations by URL, preserving order
 */
export function deduplicateCitations(citations: DiscoveredCitation[]): DiscoveredCitation[] {
  const seen = new Set<string>();
  return citations.filter(c => {
    const key = c.url.toLowerCase().replace(/\/+$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
