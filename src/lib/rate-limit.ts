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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

// Pre-configured limiters for the two API routes
export const RATE_LIMITS = {
  /** /api/analyze-content/stream — 5 requests per minute */
  analyze: { limit: 5, windowMs: 60 * 1000 },
  /** /api/optimize-content — 10 requests per minute */
  optimize: { limit: 10, windowMs: 60 * 1000 },
} as const;
