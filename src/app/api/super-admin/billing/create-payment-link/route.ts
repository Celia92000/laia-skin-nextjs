import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { organizationId, amount, description, customerEmail, customerName } = body;

    // Validation
    if (!organizationId || !amount || !customerEmail) {
      return NextResponse.json({
        error: 'Données manquantes (organizationId, amount, customerEmail requis)'
      }, { status: 400 });
    }

    if (amount < 0.5) {
      return NextResponse.json({
        error: 'Montant minimum : 0,50€'
      }, { status: 400 });
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Initialiser Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({
        error: 'Stripe non configuré'
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description || `Abonnement LAIA - ${organization.name}`,
              description: `Abonnement mensuel logiciel LAIA pour ${organization.name}`,
            },
            unit_amount: Math.round(amount * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment-cancel`,
      customer_email: customerEmail,
      metadata: {
        organizationId,
        organizationName: organization.name,
        type: 'subscription_payment',
        source: 'super_admin',
      },
    });

    // Générer un numéro de facture unique
    const year = new Date().getFullYear();
    const prefix = `LAIA-${year}-`;
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
    });
    const invoiceNumber = `${prefix}${(count + 1).toString().padStart(6, '0')}`;

    // Créer une facture dans la base de données
    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber,
        amount,
        currency: 'EUR',
        status: 'PENDING',
        stripeInvoiceId: session.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        description: description || `Abonnement LAIA - ${organization.name}`,
      },
    });

    // Envoyer l'email avec le lien de paiement
    const emailSubject = `Votre facture ${invoiceNumber} - LAIA`;
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture LAIA</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
            <tr>
              <td style="padding: 40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a589 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">LAIA</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Logiciel de gestion pour instituts</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Bonjour ${customerName || organization.name},</p>

                      <p style="margin: 0 0 20px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                        Suite à notre échange, veuillez trouver ci-dessous le lien de paiement sécurisé pour votre abonnement.
                      </p>

                      <!-- Invoice Details -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 6px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">Détails de la facture</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;">Numéro :</td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right; font-weight: bold;">${invoiceNumber}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;">Organisation :</td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${organization.name}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;">Description :</td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${description || `Abonnement LAIA`}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0 0 0; color: #333333; font-size: 16px; font-weight: bold; border-top: 2px solid #e0e0e0;">Montant TTC :</td>
                                <td style="padding: 12px 0 0 0; color: #d4b5a0; font-size: 20px; text-align: right; font-weight: bold; border-top: 2px solid #e0e0e0;">${amount.toFixed(2)} €</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 30px 0 20px 0;">
                            <a href="${session.url}" style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a589 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Procéder au paiement</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                        Ce lien de paiement est valable 24 heures.<br>
                        Paiement sécurisé par Stripe.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; font-weight: bold;">LAIA</p>
                      <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px;">Logiciel de gestion pour instituts de beauté</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} LAIA. Tous droits réservés.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Version texte pour les clients email qui ne supportent pas HTML
    const emailText = `
Bonjour ${customerName || organization.name},

Suite à notre échange, veuillez trouver ci-dessous le lien de paiement sécurisé pour votre abonnement.

DÉTAILS DE LA FACTURE
----------------------
Numéro : ${invoiceNumber}
Organisation : ${organization.name}
Description : ${description || 'Abonnement LAIA'}
Montant TTC : ${amount.toFixed(2)} €

LIEN DE PAIEMENT
${session.url}

Ce lien de paiement est valable 24 heures.
Paiement sécurisé par Stripe.

---
LAIA - Logiciel de gestion pour instituts de beauté
© ${new Date().getFullYear()} LAIA. Tous droits réservés.
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LAIA <contact@laiaskininstitut.fr>',
      to: customerEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        'X-Entity-Ref-ID': invoiceNumber,
      },
      tags: [
        { name: 'category', value: 'invoice' },
        { name: 'type', value: 'payment_link' },
      ],
    });

    return NextResponse.json({
      success: true,
      paymentLink: session.url,
      sessionId: session.id,
      invoiceId: invoice.id,
      message: 'Lien de paiement créé et envoyé par email',
    });

  } catch (error: any) {
    console.error('Erreur création lien de paiement:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors de la création du lien de paiement',
    }, { status: 500 });
  }
}
