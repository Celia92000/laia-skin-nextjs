/**
 * Schémas de validation Zod pour les routes API
 * Centralise toutes les validations pour éviter la duplication
 */

import { z } from 'zod';

// 🔒 VALIDATION LOGIN
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim()
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .max(255, 'Mot de passe trop long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 🔒 VALIDATION REGISTER
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim()
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(8, 'Mot de passe minimum 8 caractères')
    .max(100, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  name: z
    .string()
    .min(2, 'Nom minimum 2 caractères')
    .max(100, 'Nom trop long')
    .trim()
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom contient des caractères invalides'),
  phone: z
    .string()
    .optional()
    .transform(val => val || undefined)
    .refine(
      val => !val || /^(\+33|0)[1-9](\d{8})$/.test(val.replace(/\s/g, '')),
      'Format de téléphone invalide (ex: 0612345678 ou +33612345678)'
    ),
  referralCode: z
    .string()
    .optional()
    .transform(val => val || undefined)
    .refine(
      val => !val || /^LAIA[A-Z]{3}[A-Z0-9]{4}$/.test(val),
      'Code de parrainage invalide'
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// 🔒 VALIDATION CONTACT
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nom minimum 2 caractères')
    .max(100, 'Nom trop long')
    .trim()
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom contient des caractères invalides'),
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim()
    .max(255, 'Email trop long'),
  phone: z
    .string()
    .optional()
    .transform(val => val || undefined)
    .refine(
      val => !val || /^(\+33|0)[1-9](\d{8})$/.test(val.replace(/\s/g, '')),
      'Format de téléphone invalide'
    ),
  subject: z
    .string()
    .optional()
    .transform(val => val || undefined)
    .refine(
      val => !val || (val.length >= 3 && val.length <= 200),
      'Sujet entre 3 et 200 caractères'
    ),
  message: z
    .string()
    .min(10, 'Message minimum 10 caractères')
    .max(2000, 'Message maximum 2000 caractères')
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// 🛡️ Fonction utilitaire pour valider et gérer les erreurs
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    return {
      success: false,
      error: 'Données invalides',
    };
  }
}
