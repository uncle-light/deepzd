/**
 * In-memory sliding window rate limiter.
 * No external dependencies — uses a Map to track request timestamps per key.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client can retry */
  retryAfterSeconds: number;
  /** Remaining requests in the current window */
  remaining: number;
}

const store = new Map<string, number[]>();

function resolveRateLimitEnabled(): boolean {
  const explicit = process.env.ENFORCE_RATE_LIMIT?.trim().toLowerCase();
  if (explicit) {
    return explicit === "1" || explicit === "true" || explicit === "yes" || explicit === "on";
  }
  // Default: disabled in local/dev, enabled in production.
  return process.env.NODE_ENV === "production";
}

const RATE_LIMIT_ENABLED = resolveRateLimitEnabled();

// Auto-cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store) {
      const valid = timestamps.filter((ts) => now - ts < windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow Node.js to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check whether a request identified by `key` is within the rate limit.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  if (!RATE_LIMIT_ENABLED) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: config.limit,
    };
  }

  ensureCleanup(config.windowMs);

  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get existing timestamps and prune expired ones
  const timestamps = (store.get(key) ?? []).filter((ts) => ts > windowStart);

  if (timestamps.length >= config.limit) {
    // Find when the earliest request in the window expires
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  // Record this request
  timestamps.push(now);
  store.set(key, timestamps);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: config.limit - timestamps.length,
  };
}

/**
 * Extract client IP from a Next.js request.
 * Checks common proxy headers, falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const ipHeaders = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-forwarded-for",
    "x-vercel-forwarded-for",
    "forwarded",
  ];

  for (const name of ipHeaders) {
    const value = request.headers.get(name);
    if (!value) continue;

    const first = value.split(",")[0].trim();
    if (!first) continue;

    // RFC 7239 Forwarded: for=1.2.3.4;proto=https
    if (name === "forwarded") {
      const match = first.match(/for="?([^;"]+)"?/i);
      if (match?.[1]) return match[1].trim();
      continue;
    }

    return first;
  }

  return "unknown";
}

// Pre-configured limiters for the two API routes
export const RATE_LIMITS = {
  /** /api/chat — chat + tool workflow */
  chat: { limit: 20, windowMs: 60 * 1000 },
  /** /api/analyze-content/stream */
  analyze: { limit: 20, windowMs: 60 * 1000 },
  /** /api/optimize-content */
  optimize: { limit: 10, windowMs: 60 * 1000 },
} as const;
