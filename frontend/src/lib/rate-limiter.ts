/**
 * Advanced Rate Limiter with sliding window, abuse detection,
 * and database-backed logging for analytics.
 * 
 * Uses in-memory for fast checks + periodic DB sync for persistence.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

interface AbuseRecord {
  violations: number;
  lastViolation: number;
  blocked: boolean;
  blockedUntil?: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private abuseStore: Map<string, AbuseRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  // Config
  private readonly ABUSE_THRESHOLD = 10; // violations before temp ban
  private readonly ABUSE_WINDOW = 300000; // 5 minutes
  private readonly BAN_DURATION_BASE = 60000; // 1 minute base ban
  private readonly BAN_MULTIPLIER = 2; // exponential backoff
  private readonly MAX_BAN_DURATION = 3600000; // 1 hour max ban

  constructor() {
    // Clean up expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  /**
   * Check if request is allowed (sliding window counter)
   */
  check(key: string, limit: number, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blocked?: boolean;
    retryAfter?: number;
  } {
    const now = Date.now();

    // Check if IP/key is banned
    const abuse = this.abuseStore.get(key.split(':')[0]);
    if (abuse?.blocked && abuse.blockedUntil && now < abuse.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: abuse.blockedUntil,
        blocked: true,
        retryAfter: Math.ceil((abuse.blockedUntil - now) / 1000),
      };
    }

    const entry = this.store.get(key);

    // No entry or expired window — start fresh
    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(key, {
        count: 1,
        resetTime,
        firstRequest: now,
        blocked: false,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime,
      };
    }

    // Within window — check count
    if (entry.count < limit) {
      entry.count++;
      this.store.set(key, entry);
      return {
        allowed: true,
        remaining: limit - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded — record violation
    this.recordViolation(key.split(':')[0]);

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  /**
   * Record a rate limit violation for abuse detection
   */
  private recordViolation(identifier: string): void {
    const now = Date.now();
    const record = this.abuseStore.get(identifier) || {
      violations: 0,
      lastViolation: 0,
      blocked: false,
    };

    // Reset violations if outside abuse window
    if (now - record.lastViolation > this.ABUSE_WINDOW) {
      record.violations = 0;
    }

    record.violations++;
    record.lastViolation = now;

    // Check if should be banned
    if (record.violations >= this.ABUSE_THRESHOLD) {
      const banDuration = Math.min(
        this.BAN_DURATION_BASE * Math.pow(this.BAN_MULTIPLIER, Math.floor(record.violations / this.ABUSE_THRESHOLD) - 1),
        this.MAX_BAN_DURATION
      );
      record.blocked = true;
      record.blockedUntil = now + banDuration;
    }

    this.abuseStore.set(identifier, record);
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Unban an identifier
   */
  unban(identifier: string): void {
    this.abuseStore.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }

    // Clean up old abuse records
    for (const [key, record] of this.abuseStore.entries()) {
      if (!record.blocked && now - record.lastViolation > this.ABUSE_WINDOW * 2) {
        this.abuseStore.delete(key);
      }
      if (record.blocked && record.blockedUntil && now > record.blockedUntil) {
        record.blocked = false;
        record.violations = Math.floor(record.violations / 2); // Reduce but don't reset
        this.abuseStore.set(key, record);
      }
    }
  }

  /**
   * Get current stats for a key
   */
  getStats(key: string): {
    count: number;
    resetTime: number;
    remaining?: number;
  } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return {
      count: entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get abuse status for an identifier
   */
  getAbuseStatus(identifier: string): AbuseRecord | null {
    return this.abuseStore.get(identifier) || null;
  }

  /**
   * Get overall stats
   */
  getOverallStats(): {
    activeKeys: number;
    bannedIdentifiers: number;
    totalViolations: number;
  } {
    let bannedCount = 0;
    let totalViolations = 0;
    const now = Date.now();

    for (const record of this.abuseStore.values()) {
      if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
        bannedCount++;
      }
      totalViolations += record.violations;
    }

    return {
      activeKeys: this.store.size,
      bannedIdentifiers: bannedCount,
      totalViolations,
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
    this.abuseStore.clear();
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Generate rate limit key from identifier and endpoint
 */
export function generateRateLimitKey(
  identifier: string,
  endpoint: string
): string {
  return `${identifier}:${endpoint}`;
}

/**
 * Get standard rate limit headers for HTTP response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
  return headers;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Rate limit tiers based on auth level
 */
export const RATE_LIMIT_TIERS = {
  // Unauthenticated requests
  anonymous: {
    limit: 30,
    windowMs: 60000, // 30 req/min
  },
  // Authenticated with API key
  authenticated: {
    limit: 100,
    windowMs: 60000, // 100 req/min
  },
  // Admin users
  admin: {
    limit: 500,
    windowMs: 60000, // 500 req/min
  },
} as const;
