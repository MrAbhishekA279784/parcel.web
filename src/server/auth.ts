import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { queryOne, run } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'parcelflow-industrial-jwt-secret-2026';

// ----------------------------------------------------
// Password Hashing (PBKDF2 with random salt)
// ----------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Support legacy plain demo password during transition
  if (storedHash === password || (storedHash === 'demo123' && password === 'demo123')) {
    return true;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    // If not in salt:hash format, fallback check
    return storedHash === password;
  }

  const [salt, originalHash] = parts;
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// ----------------------------------------------------
// JWT Token Signing & Verification (HMAC-SHA256)
// ----------------------------------------------------
export interface TokenPayload {
  id: string;
  email: string;
  role: 'customer' | 'operator' | 'admin';
  name: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function generateToken(user: { id: string; email: string; role: 'customer' | 'operator' | 'admin'; name: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + 7 * 24 * 60 * 60 // 7 days
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token) return null;

    // Also support legacy token format: pf-jwt-<userId>-<timestamp>
    if (token.startsWith('pf-jwt-')) {
      const parts = token.split('-');
      // format: pf-jwt-<userId>-<timestamp>
      const userId = parts.slice(2, parts.length - 1).join('-');
      if (userId) {
        const user = queryOne<{ id: string; email: string; role: any; name: string }>(
          "SELECT id, email, role, name FROM users WHERE id = ?", [userId]
        );
        if (user) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400
          };
        }
      }
    }

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Authentication & Role Middlewares
// ----------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'operator' | 'admin';
    name: string;
  };
}

export function extractUserFromRequest(req: Request): { id: string; email: string; role: 'customer' | 'operator' | 'admin'; name: string } | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifyToken(token);
    if (verified) {
      return { id: verified.id, email: verified.email, role: verified.role, name: verified.name };
    }
  }

  // Fallback to x-user-id header
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    const user = queryOne<{ id: string; email: string; role: any; name: string }>(
      "SELECT id, email, role, name FROM users WHERE id = ?", [userId]
    );
    if (user) {
      return { id: user.id, email: user.email, role: user.role, name: user.name };
    }
  }

  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  req.user = user;
  next();
}

export function requireRole(allowedRoles: ('customer' | 'operator' | 'admin') | ('customer' | 'operator' | 'admin')[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = extractUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    req.user = user;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
}

// ----------------------------------------------------
// Login Rate Limiter (Sliding Window in-memory)
// ----------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}
const loginAttempts = new Map<string, RateLimitRecord>();

export function loginRateLimiter(maxAttempts = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const record = loginAttempts.get(ip) || { timestamps: [] };

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter(t => now - t < windowMs);

    if (record.timestamps.length >= maxAttempts) {
      const oldest = record.timestamps[0];
      const waitTimeSec = Math.ceil((windowMs - (now - oldest)) / 1000);
      res.setHeader('Retry-After', waitTimeSec);
      return res.status(429).json({
        error: `Too many login attempts. Please try again in ${waitTimeSec} seconds.`
      });
    }

    record.timestamps.push(now);
    loginAttempts.set(ip, record);
    next();
  };
}
