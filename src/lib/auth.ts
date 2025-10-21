import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): { userId: string; role: string; organizationId?: string | null } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; organizationId?: string | null };
  } catch (error) {
    return null;
  }
}