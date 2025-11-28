import { NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

// Exporter tous les schemas
export * from './auth';
export * from './public';

/**
 * Valide les données avec un schema Zod et retourne une erreur NextResponse si invalide
 * @param schema Schema Zod
 * @param data Données à valider
 * @returns { success: true, data } | { success: false, error: NextResponse }
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Données invalides',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: 'Erreur de validation' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Middleware async pour valider le body d'une requête
 * Usage: const body = await validateBody(request, schema);
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Body JSON invalide' },
        { status: 400 }
      ),
    };
  }
}
