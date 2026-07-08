import { Redis } from '@upstash/redis';

// Pokusíme se inicializovat Redis, pokud jsou k dispozici klíče
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('⚠️ [Redis] Chybí UPSTASH_REDIS_REST klíče. Rate limiting poběží pouze in-memory (není vhodné pro produkci s více servery).');
}

type RateLimitInfo = {
  count: number;
  resetTime: number;
};

// In-memory fallback
const store = new Map<string, RateLimitInfo>();

export async function checkApiRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const now = Date.now();
  
  // REDIS PATH
  if (redis) {
    try {
      const key = `ratelimit:${ip}`;
      // Pipelining pro rychlost
      const p = redis.pipeline();
      p.incr(key);
      p.pttl(key);
      const [count, ttl] = await p.exec() as [number, number];

      // Pokud klíč právě vznikl, nastavíme mu expiraci
      if (count === 1 || ttl === -1) {
        await redis.pexpire(key, windowMs);
      }

      const resetTime = now + (ttl > 0 ? ttl : windowMs);

      return {
        success: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        resetTime,
      };
    } catch (error) {
      console.error('Redis error during rate limiting:', error);
      // Pokud Redis zhavaruje, propadneme tiše do in-memory (Fail-open/Fail-soft)
    }
  }

  // IN-MEMORY PATH (Fallback)
  let info = store.get(ip);
  if (info && info.resetTime < now) {
    store.delete(ip);
    info = undefined;
  }

  if (!info) {
    info = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(ip, info);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: info.resetTime,
    };
  }

  info.count += 1;
  store.set(ip, info);

  return {
    success: info.count <= limit,
    limit,
    remaining: Math.max(0, limit - info.count),
    resetTime: info.resetTime,
  };
}
