import { z } from 'zod';

// Schema pour l'inscription newsletter
export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(255, 'Email trop long')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .max(100, 'Nom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']*$/, 'Le nom contient des caractères invalides')
    .optional()
    .nullable(),
});

// Schema pour le formulaire de contact
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères invalides'),
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(255, 'Email trop long')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\+\-\(\)]{8,20}$/.test(val),
      'Numéro de téléphone invalide'
    ),
  subject: z
    .string()
    .min(3, 'Le sujet doit contenir au moins 3 caractères')
    .max(200, 'Sujet trop long'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(5000, 'Message trop long (max 5000 caractères)'),
});

// Schema pour les avis clients
export const reviewSchema = z.object({
  rating: z
    .number()
    .int('La note doit être un entier')
    .min(1, 'Note minimum : 1')
    .max(5, 'Note maximum : 5'),
  comment: z
    .string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(2000, 'Commentaire trop long (max 2000 caractères)')
    .optional(),
  serviceId: z.string().optional(),
  reservationId: z.string().optional(),
});

// Types exportés
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
