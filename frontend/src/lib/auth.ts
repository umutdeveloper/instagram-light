import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  username?: string;
  sub?: number;
  exp?: number;
  iat?: number;
  [key: string]: string | number | undefined;
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to decode token:', error.message);
    } else {
      console.error('Failed to decode token:', error);
    }
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Check if token is valid
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Extract username from token
 */
export function getUsernameFromToken(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.username || null;
}

/**
 * Extract user ID from token
 */
export function getUserIdFromToken(token: string): number | null {
  const decoded = decodeToken(token);
  return decoded?.sub ? Number(decoded.sub) : null;
}
