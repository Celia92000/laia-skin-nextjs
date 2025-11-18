import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role as string) !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { type, config } = body;

    if (!type || !config) {
      return NextResponse.json({ error: 'Type et config requis' }, { status: 400 });
    }

    // Tester la connexion selon le type
    switch (type) {
      case 'resend': {
        // Test Resend
        const { apiKey, senderEmail, senderName } = config;

        if (!apiKey || !senderEmail || !senderName) {
          return NextResponse.json({
            error: 'Clé API, email et nom expéditeur requis'
          }, { status: 400 });
        }

        try {
          const resend = new Resend(apiKey);

          // Test de validation de la clé API (ne pas envoyer d'email)
          // On essaie de récupérer les domaines pour vérifier que la clé fonctionne
          await resend.domains.list();

          log.info('Test Resend réussi', { email: senderEmail });

          return NextResponse.json({
            success: true,
            message: 'Connexion Resend réussie'
          });
        } catch (error: any) {
          log.error('Erreur test Resend:', error);
          return NextResponse.json({
            error: `Erreur Resend: ${error.message || 'Clé API invalide'}`
          }, { status: 400 });
        }
      }

      case 'whatsapp': {
        // Test WhatsApp Business API
        const { apiKey, phoneId, businessId } = config;

        if (!apiKey || !phoneId || !businessId) {
          return NextResponse.json({
            error: 'Token API, Phone ID et Business ID requis'
          }, { status: 400 });
        }

        try {
          // Test de la validité du token en récupérant les infos du numéro
          const response = await fetch(
            `https://graph.facebook.com/v21.0/${phoneId}`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`
              }
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Token invalide');
          }

          const data = await response.json();

          log.info('Test WhatsApp réussi', { phoneId, businessId });

          return NextResponse.json({
            success: true,
            message: 'Connexion WhatsApp Business réussie',
            phoneNumber: data.display_phone_number || ''
          });
        } catch (error: any) {
          log.error('Erreur test WhatsApp:', error);
          return NextResponse.json({
            error: `Erreur WhatsApp: ${error.message || 'Identifiants invalides'}`
          }, { status: 400 });
        }
      }

      default:
        return NextResponse.json({
          error: 'Type d\'intégration non supporté pour le test'
        }, { status: 400 });
    }
  } catch (error: any) {
    log.error('Erreur test intégration:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
