/**
 * Service Google My Business API
 * Gestion OAuth2 et récupération des avis Google
 */

import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';

// Scopes nécessaires pour Google My Business
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage', // Gérer les établissements
  'https://www.googleapis.com/auth/plus.business.manage', // Gérer Google Business Profile
];

/**
 * Créer un client OAuth2 Google
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Générer l'URL d'autorisation Google
 */
export function getAuthorizationUrl(organizationId: string): string {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Pour obtenir un refresh token
    scope: SCOPES,
    state: organizationId, // Passer l'organizationId dans le state pour le récupérer au callback
    prompt: 'consent', // Forcer le consentement pour obtenir le refresh token
  });

  return authUrl;
}

/**
 * Échanger le code d'autorisation contre des tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    log.error('Erreur échange code OAuth2:', error);
    throw error;
  }
}

/**
 * Rafraîchir le token d'accès
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    log.error('Erreur refresh token:', error);
    throw error;
  }
}

/**
 * Obtenir un client OAuth2 authentifié pour une organisation
 */
export async function getAuthenticatedClient(organizationId: string) {
  const orgConfig = await prisma.organizationConfig.findUnique({
    where: { organizationId },
    select: {
      googleBusinessAccessToken: true,
      googleBusinessRefreshToken: true,
      googleBusinessTokenExpiry: true,
      googleBusinessConnected: true,
    },
  });

  if (!orgConfig || !orgConfig.googleBusinessConnected || !orgConfig.googleBusinessRefreshToken) {
    throw new Error('Organisation non connectée à Google My Business');
  }

  const oauth2Client = createOAuth2Client();

  // Vérifier si le token est expiré
  const now = new Date();
  const tokenExpiry = orgConfig.googleBusinessTokenExpiry;

  if (tokenExpiry && tokenExpiry <= now) {
    // Token expiré, rafraîchir
    log.info('Token Google expiré, rafraîchissement...');
    const newTokens = await refreshAccessToken(orgConfig.googleBusinessRefreshToken);

    // Sauvegarder les nouveaux tokens
    await prisma.organizationConfig.update({
      where: { organizationId },
      data: {
        googleBusinessAccessToken: newTokens.access_token || undefined,
        googleBusinessTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : undefined,
      },
    });

    oauth2Client.setCredentials(newTokens);
  } else {
    // Token encore valide
    oauth2Client.setCredentials({
      access_token: orgConfig.googleBusinessAccessToken || undefined,
      refresh_token: orgConfig.googleBusinessRefreshToken || undefined,
    });
  }

  return oauth2Client;
}

/**
 * Récupérer les comptes Google My Business
 */
export async function getGoogleBusinessAccounts(organizationId: string) {
  const oauth2Client = await getAuthenticatedClient(organizationId);

  try {
    const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client });

    const response = await mybusiness.accounts.list();
    return response.data.accounts || [];
  } catch (error) {
    log.error('Erreur récupération comptes Google My Business:', error);
    throw error;
  }
}

/**
 * Récupérer les établissements (locations) d'un compte
 */
export async function getGoogleBusinessLocations(organizationId: string, accountName: string) {
  const oauth2Client = await getAuthenticatedClient(organizationId);

  try {
    const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client });

    const response = await mybusiness.accounts.locations.list({
      parent: accountName,
      readMask: 'name,title,storefrontAddress,websiteUri',
    });

    return response.data.locations || [];
  } catch (error) {
    log.error('Erreur récupération établissements:', error);
    throw error;
  }
}

// Type temporaire pour les avis Google
interface GoogleReview {
  reviewId?: string;
  reviewer?: {
    displayName?: string;
    profilePhotoUrl?: string;
  };
  starRating?: 'FIVE' | 'FOUR' | 'THREE' | 'TWO' | 'ONE';
  comment?: string;
  createTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
  };
}

/**
 * Récupérer les avis Google d'un établissement
 * TODO: Migrer vers Google Business Profile API (mybusinessbusinessinformation)
 * L'API mybusiness v4 a été dépréciée
 */
export async function getGoogleReviews(organizationId: string, locationName: string): Promise<GoogleReview[]> {
  const oauth2Client = await getAuthenticatedClient(organizationId);

  try {
    // TODO: Remplacer par la nouvelle API Google Business Profile
    // const mybusiness = google.mybusiness({ version: 'v4', auth: oauth2Client });
    // const response = await mybusiness.accounts.locations.reviews.list({
    //   parent: locationName,
    //   pageSize: 50,
    // });
    // return response.data.reviews || [];

    // Temporairement retourner un tableau vide en attendant la migration
    log.warn('Google My Business API non migrée - retourne tableau vide');
    return [] as GoogleReview[];
  } catch (error) {
    log.error('Erreur récupération avis Google:', error);
    throw error;
  }
}

/**
 * Synchroniser les avis Google dans la base de données
 */
export async function syncGoogleReviews(organizationId: string) {
  try {
    log.info(`[Google Reviews] Synchronisation pour organisation ${organizationId}`);

    // Récupérer la configuration
    const orgConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId },
      select: {
        googleBusinessAccountId: true,
        googlePlaceId: true,
      },
    });

    if (!orgConfig || !orgConfig.googleBusinessAccountId) {
      throw new Error('Google Business Account ID manquant');
    }

    // Récupérer les établissements
    const locations = await getGoogleBusinessLocations(organizationId, orgConfig.googleBusinessAccountId);

    if (locations.length === 0) {
      log.warn('Aucun établissement Google trouvé');
      return { synced: 0, errors: 0 };
    }

    // Utiliser le premier établissement (ou celui correspondant au placeId)
    let targetLocation = locations[0];
    if (orgConfig.googlePlaceId) {
      const found = locations.find(loc => loc.name?.includes(orgConfig.googlePlaceId!));
      if (found) targetLocation = found;
    }

    if (!targetLocation.name) {
      throw new Error('Location name manquant');
    }

    // Récupérer les avis
    const reviews = await getGoogleReviews(organizationId, targetLocation.name);

    log.info(`[Google Reviews] ${reviews.length} avis trouvés`);

    let synced = 0;
    let errors = 0;

    // Sauvegarder dans la base de données
    for (const review of reviews) {
      try {
        if (!review.reviewId) {
          errors++;
          continue;
        }

        await prisma.googleReview.upsert({
          where: { reviewId: review.reviewId },
          create: {
            organizationId,
            reviewId: review.reviewId,
            authorName: review.reviewer?.displayName || 'Anonyme',
            authorPhoto: review.reviewer?.profilePhotoUrl || null,
            rating: review.starRating === 'FIVE' ? 5 :
                    review.starRating === 'FOUR' ? 4 :
                    review.starRating === 'THREE' ? 3 :
                    review.starRating === 'TWO' ? 2 : 1,
            comment: review.comment || '',
            publishedAt: review.createTime ? new Date(review.createTime) : new Date(),
            replyText: review.reviewReply?.comment || null,
            replyAt: review.reviewReply?.updateTime ? new Date(review.reviewReply.updateTime) : null,
          },
          update: {
            rating: review.starRating === 'FIVE' ? 5 :
                    review.starRating === 'FOUR' ? 4 :
                    review.starRating === 'THREE' ? 3 :
                    review.starRating === 'TWO' ? 2 : 1,
            comment: review.comment || '',
            replyText: review.reviewReply?.comment || null,
            replyAt: review.reviewReply?.updateTime ? new Date(review.reviewReply.updateTime) : null,
          },
        });

        synced++;
      } catch (error) {
        log.error('Erreur sauvegarde avis:', error);
        errors++;
      }
    }

    // Mettre à jour la date de dernière synchronisation
    await prisma.organizationConfig.update({
      where: { organizationId },
      data: {
        lastGoogleSync: new Date(),
      },
    });

    log.info(`[Google Reviews] Synchronisation terminée: ${synced} synced, ${errors} errors`);

    return { synced, errors, total: reviews.length };
  } catch (error) {
    log.error('Erreur synchronisation Google Reviews:', error);
    throw error;
  }
}

/**
 * Répondre à un avis Google
 * TODO: Migrer vers Google Business Profile API
 * L'API mybusiness v4 a été dépréciée
 */
export async function replyToGoogleReview(
  organizationId: string,
  reviewName: string,
  replyText: string
) {
  const oauth2Client = await getAuthenticatedClient(organizationId);

  try {
    // TODO: Remplacer par la nouvelle API Google Business Profile
    // const mybusiness = google.mybusiness({ version: 'v4', auth: oauth2Client });
    // const response = await mybusiness.accounts.locations.reviews.updateReply({
    //   name: reviewName,
    //   requestBody: {
    //     comment: replyText,
    //   },
    // });
    // return response.data;

    // Temporairement retourner null en attendant la migration
    log.warn('Google My Business reply API non migrée - fonction désactivée');
    return null;
  } catch (error) {
    log.error('Erreur réponse avis Google:', error);
    throw error;
  }
}
