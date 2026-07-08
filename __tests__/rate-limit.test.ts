import { expect, test, describe, beforeEach } from 'vitest';
import { checkApiRateLimit } from '../src/lib/rate-limit';

describe('Rate Limiter', () => {
  const IP = '192.168.1.1';

  test('should allow requests within limit', async () => {
    const result = await checkApiRateLimit(IP, 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  test('should block requests over limit', async () => {
    // Fill up the limit
    for (let i = 0; i < 4; i++) {
      await checkApiRateLimit(IP, 5, 60000);
    }
    
    // 6th request should fail
    const result = await checkApiRateLimit(IP, 5, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
