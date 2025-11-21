import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

// POST - Renouveler un token
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
    if (!auth.isValid || !auth.user || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const params = await context.params;
    const tokenId = params.id;
    const body = await request.json();
    const { service } = body;

    // Récupérer le token
    const token = await prisma.apiToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return NextResponse.json({ error: 'Token introuvable' }, { status: 404 });
    }

    // Générer les instructions de renouvellement selon le service
    let instructions: any = {
      service: token.service,
      message: '',
      steps: [],
      url: null,
    };

    switch (token.service) {
      case 'WHATSAPP':
        instructions = {
          service: 'WhatsApp',
          message: 'Pour renouveler votre token WhatsApp Business',
          steps: [
            '1. Connectez-vous à Meta Business Manager : https://business.facebook.com/',
            '2. Sélectionnez votre compte WhatsApp Business',
            '3. Allez dans Configuration > Tokens d\'accès',
            '4. Cliquez sur "Générer un nouveau token"',
            '5. Copiez le nouveau token et collez-le ici',
          ],
          url: 'https://business.facebook.com/',
        };
        break;

      case 'INSTAGRAM':
        instructions = {
          service: 'Instagram',
          message: 'Pour renouveler votre token Instagram',
          steps: [
            '1. Connectez-vous à Facebook Developers : https://developers.facebook.com/',
            '2. Sélectionnez votre application',
            '3. Allez dans Outils > Outils de token',
            '4. Prolongez le token ou générez un nouveau token',
            '5. Copiez le nouveau token et collez-le ici',
          ],
          url: 'https://developers.facebook.com/',
        };
        break;

      case 'FACEBOOK':
        instructions = {
          service: 'Facebook',
          message: 'Pour renouveler votre token de page Facebook',
          steps: [
            '1. Connectez-vous à Facebook Developers : https://developers.facebook.com/',
            '2. Sélectionnez votre application',
            '3. Allez dans Outils > Explorateur de l\'API Graph',
            '4. Sélectionnez votre page dans le menu déroulant',
            '5. Cliquez sur "Obtenir le token d\'accès de la page"',
            '6. Copiez le nouveau token et collez-le ici',
          ],
          url: 'https://developers.facebook.com/tools/explorer/',
        };
        break;

      case 'STRIPE':
        instructions = {
          service: 'Stripe',
          message: 'Les clés Stripe n\'expirent pas automatiquement',
          steps: [
            '1. Connectez-vous à Stripe Dashboard : https://dashboard.stripe.com/',
            '2. Allez dans Développeurs > Clés API',
            '3. Si nécessaire, révoquez l\'ancienne clé et créez-en une nouvelle',
            '4. Copiez la nouvelle clé et collez-la ici',
          ],
          url: 'https://dashboard.stripe.com/apikeys',
        };
        break;

      case 'RESEND':
        instructions = {
          service: 'Resend',
          message: 'Pour gérer vos clés API Resend',
          steps: [
            '1. Connectez-vous à Resend : https://resend.com/api-keys',
            '2. Créez une nouvelle clé API ou révoqué l\'ancienne',
            '3. Copiez la nouvelle clé et collez-la ici',
          ],
          url: 'https://resend.com/api-keys',
        };
        break;

      default:
        instructions = {
          service: token.service,
          message: 'Veuillez renouveler manuellement ce token',
          steps: [
            'Consultez la documentation du service pour obtenir un nouveau token',
            'Une fois obtenu, utilisez l\'endpoint POST /api/admin/api-tokens pour le mettre à jour',
          ],
          url: null,
        };
    }

    return NextResponse.json({
      success: true,
      tokenId: token.id,
      instructions,
    });
  } catch (error) {
    log.error('Erreur renouvellement token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
