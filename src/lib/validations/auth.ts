import { z } from 'zod';

// Schema pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .max(128, 'Mot de passe trop long'),
  rememberMe: z.boolean().optional().default(false),
});

// Schema pour l'inscription
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères invalides'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\+\-\(\)]{8,20}$/.test(val),
      'Numéro de téléphone invalide'
    ),
  referralCode: z
    .string()
    .max(20, 'Code de parrainage invalide')
    .optional()
    .nullable(),
});

// Schema pour mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(255, 'Email trop long'),
});

// Schema pour reset de mot de passe
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
});

// Types exportés
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
