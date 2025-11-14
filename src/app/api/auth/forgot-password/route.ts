import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    })

    // Pour des raisons de sécurité, on renvoie toujours un succès même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      })
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // URL de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/nouveau-mot-de-passe?token=${resetToken}`

    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe LAIA Connect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌸 LAIA Connect</h1>
            </div>
            <div class="content">
              <h2>Réinitialisation de votre mot de passe</h2>
              <p>Bonjour ${user.name},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ce lien est valide pendant <strong>1 heure</strong>.</p>
              <div class="warning">
                <strong>⚠️ Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.
              </div>
              <p>Pour des raisons de sécurité, vous pouvez également copier ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 12px;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© 2025 LAIA Connect - Logiciel de gestion pour professionnels de la beauté</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return NextResponse.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    })

  } catch (error) {
    log.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi de l'email" },
      { status: 500 }
    )
  }
}
