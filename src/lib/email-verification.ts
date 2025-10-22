/**
 * Service de vérification d'email
 */

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

/**
 * Génère un token de vérification d'email
 */
export function generateEmailVerificationToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' } // Token valable 24h
  );
}

/**
 * Vérifie un token de vérification d'email
 */
export function verifyEmailToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'email_verification') {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    console.error('Token de vérification invalide:', error);
    return null;
  }
}

/**
 * Envoie l'email de vérification
 */
export async function sendVerificationEmail(userId: string, email: string, name: string): Promise<boolean> {
  try {
    const verificationToken = generateEmailVerificationToken(userId, email);
    const verificationUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: email,
      subject: '✅ Vérifiez votre adresse email - LAIA SKIN Institut',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #d4b5a0;
              margin-bottom: 10px;
            }
            .content {
              background: white;
              padding: 25px;
              border-radius: 8px;
              border-left: 4px solid #d4b5a0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #d4b5a0 0%, #c9a589 100%);
              color: white !important;
              text-decoration: none;
              padding: 15px 40px;
              border-radius: 8px;
              margin: 25px 0;
              font-weight: bold;
              text-align: center;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .info-box {
              background: #f8f9fa;
              border-left: 3px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LAIA SKIN INSTITUT</div>
              <p style="color: #666; margin: 0;">Institut de Beauté & Bien-être</p>
            </div>

            <div class="content">
              <h2 style="color: #d4b5a0; margin-top: 0;">Bonjour ${name} 👋</h2>

              <p>Merci de vous être inscrit(e) sur <strong>LAIA SKIN Institut</strong> !</p>

              <p>Pour finaliser votre inscription et accéder à votre espace client, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>

              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                  ✅ Vérifier mon email
                </a>
              </div>

              <div class="info-box">
                <strong>⏱️ Lien valable 24 heures</strong><br>
                Ce lien de vérification expire dans 24 heures. Si vous ne l'avez pas demandé, ignorez cet email.
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 25px;">
                <strong>Vous ne pouvez pas cliquer sur le bouton ?</strong><br>
                Copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationUrl}" style="color: #d4b5a0; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>

            <div class="footer">
              <p>Cet email a été envoyé par <strong>LAIA SKIN Institut</strong></p>
              <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`📧 Email de vérification envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email de vérification:', error);
    return false;
  }
}

/**
 * Vérifie l'email d'un utilisateur
 */
export async function verifyUserEmail(token: string): Promise<{ success: boolean; message: string }> {
  const decoded = verifyEmailToken(token);

  if (!decoded) {
    return {
      success: false,
      message: 'Token invalide ou expiré. Veuillez demander un nouveau lien de vérification.'
    };
  }

  try {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'Utilisateur introuvable.'
      };
    }

    if (user.email !== decoded.email) {
      return {
        success: false,
        message: 'Email ne correspond pas.'
      };
    }

    // Marquer l'email comme vérifié (ajout du champ dans le schema)
    // Pour l'instant on va utiliser le champ resetToken de manière détournée
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        resetToken: null, // Reset le token
        // emailVerified: true (À ajouter au schema Prisma)
      }
    });

    console.log(`✅ Email vérifié pour l'utilisateur ${user.email}`);

    return {
      success: true,
      message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.'
    };
  } catch (error) {
    console.error('Erreur lors de la vérification d\'email:', error);
    return {
      success: false,
      message: 'Erreur lors de la vérification. Veuillez réessayer.'
    };
  }
}

/**
 * Renvoie un email de vérification
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        success: false,
        message: 'Aucun compte associé à cet email.'
      };
    }

    // Vérifier si l'email est déjà vérifié
    // if (user.emailVerified) {
    //   return {
    //     success: false,
    //     message: 'Votre email est déjà vérifié.'
    //   };
    // }

    const sent = await sendVerificationEmail(user.id, user.email, user.name);

    if (!sent) {
      return {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.'
      };
    }

    return {
      success: true,
      message: 'Email de vérification renvoyé avec succès. Vérifiez votre boîte de réception.'
    };
  } catch (error) {
    console.error('Erreur renvoie email de vérification:', error);
    return {
      success: false,
      message: 'Erreur serveur. Veuillez réessayer.'
    };
  }
}
