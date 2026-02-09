/**
 * API validation constants
 * Centralized configuration for content validation rules
 */

export const CONTENT_LIMITS = {
  /** Minimum content length in characters */
  MIN_LENGTH: 50,
  /** Maximum content length in characters */
  MAX_LENGTH: 10000,
} as const;

/** URL fetch safeguards (SSRF/timeout/size) */
export const URL_FETCH_LIMITS = {
  /** Max redirect hops allowed when fetching user-provided URL */
  MAX_REDIRECTS: 3,
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 10000,
  /** Max bytes read from remote response body */
  MAX_BYTES: 2_000_000,
} as const;
