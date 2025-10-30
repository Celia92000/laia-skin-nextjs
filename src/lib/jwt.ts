import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  role: string;
  organizationId?: string;
  email?: string;
}

/**
 * Génère un token JWT
 */
export function generateToken(payload: JWTPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Décode un token JWT sans vérification (pour inspection)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Alias pour verifyJWT (compatibilité avec code existant)
 */
export const verifyToken = verifyJWT;
