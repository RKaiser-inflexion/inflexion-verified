import { expect, test, describe } from 'vitest';
import { signJWT, verifyJWT } from '../src/lib/jwt';

describe('JWT Auth', () => {
  test('should generate and verify token successfully', async () => {
    const payload = { username: 'admin', role: 'superadmin' };
    
    // Sign
    const token = await signJWT(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    // Verify
    const decoded = await verifyJWT(token);
    expect(decoded).toBeDefined();
    expect(decoded?.username).toBe('admin');
    expect(decoded?.role).toBe('superadmin');
  });

  test('should fail to verify invalid token', async () => {
    const decoded = await verifyJWT('invalid.token.here');
    expect(decoded).toBeNull();
  });
});
