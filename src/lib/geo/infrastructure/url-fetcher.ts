/**
 * URL fetcher with SSRF protection
 * Extracted from content-analyzer.ts
 */

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { URL_FETCH_LIMITS } from '../../constants';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (isIP(mapped) === 4) return isPrivateIPv4(mapped);
  }

  return false;
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return true;
}

/** 通过独立环境变量控制是否跳过 DNS SSRF 检查（代理软件会返回 198.18.x.x 等虚拟 IP） */
const SKIP_DNS_SSRF_CHECK = process.env.SKIP_DNS_SSRF_CHECK === 'true';

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Private network URL is not allowed');
  }

  const hostIpVersion = isIP(hostname);
  if (hostIpVersion > 0) {
    if (isPrivateAddress(hostname)) {
      throw new Error('Private IP URL is not allowed');
    }
    return parsed;
  }

  if (SKIP_DNS_SSRF_CHECK) {
    return parsed;
  }

  let records: Array<{ address: string }> = [];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('Hostname resolution failed');
  }

  if (records.length === 0) {
    throw new Error('Hostname resolution failed');
  }

  for (const record of records) {
    if (isPrivateAddress(record.address)) {
      throw new Error('Resolved private IP is not allowed');
    }
  }

  return parsed;
}

async function fetchWithTimeout(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_LIMITS.TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DeepZD/1.0)' },
      redirect: 'manual',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('URL fetch timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSafeUrl(rawUrl: string): Promise<Response> {
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= URL_FETCH_LIMITS.MAX_REDIRECTS; hop++) {
    const safeUrl = await assertPublicUrl(currentUrl);
    const response = await fetchWithTimeout(safeUrl);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Redirect location missing');
      }
      currentUrl = new URL(location, safeUrl).toString();
      continue;
    }

    return response;
  }

  throw new Error('Too many redirects');
}

async function readResponseTextWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    const fallbackText = await response.text();
    if (Buffer.byteLength(fallbackText, 'utf8') > maxBytes) {
      throw new Error(`URL content too large (max ${maxBytes} bytes)`);
    }
    return fallbackText;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let totalBytes = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!value) continue;
    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`URL content too large (max ${maxBytes} bytes)`);
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}

/**
 * Fetch content from URL with SSRF protection
 */
export async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetchSafeUrl(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await readResponseTextWithLimit(response, URL_FETCH_LIMITS.MAX_BYTES);

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}
