import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('❌ ERREUR CRITIQUE: La variable d\'environnement JWT_SECRET est obligatoire. Définissez-la dans votre fichier .env.local');
}

// Type assertion since we know JWT_SECRET is defined after the check
const jwtSecret: string = JWT_SECRET;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(
  payload: { userId: string; role: string; organizationId?: string | null },
  rememberMe: boolean = false
): string {
  const expiresIn = rememberMe ? '90d' : '30d';
  return jwt.sign(payload, jwtSecret, { expiresIn });
}

export function verifyToken(token: string): { userId: string; role: string; organizationId?: string | null } | null {
  try {
    return jwt.verify(token, jwtSecret) as { userId: string; role: string; organizationId?: string | null };
  } catch (error) {
    return null;
  }
}

export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean;
  user?: { userId: string; role: string; organizationId?: string | null } | null;
}> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return { isValid: false };
    }

    return {
      isValid: true,
      user: decoded,
    };
  } catch (error) {
    return { isValid: false };
  }
}