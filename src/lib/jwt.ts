import { SignJWT, jwtVerify } from 'jose';

const rawSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !rawSecret) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
}

const secretKey = rawSecret || 'inflexion-super-secret-development-key';
const key = new TextEncoder().encode(secretKey);

export async function signJWT(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}
