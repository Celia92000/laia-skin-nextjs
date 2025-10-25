import { getResend } from '@/lib/resend';

interface SendPasswordResetEmailParams {
  email: string;
  name: string;
  resetToken: string;
}

interface SendDemoConfirmationEmailParams {
  email: string;
  contactName: string;
  institutName: string;
  meetingUrl: string;
  date: Date;
  duration: number;
}

export async function sendPasswordResetEmail({ email, name, resetToken }: SendPasswordResetEmailParams) {
  // Utiliser l'URL appropriée selon l'environnement
  const baseUrl = process.env.VERCEL 
    ? 'https://laia-skin-institut-as92.vercel.app'
    : 'http://localhost:3001';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de votre mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 40px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">LAIA SKIN INSTITUT</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Beauté & Bien-être</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                    Bonjour ${name || 'Cliente'} 👋
                                </h2>
                                
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Vous avez demandé la réinitialisation de votre mot de passe pour votre compte LAIA SKIN INSTITUT.
                                </p>
                                
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                                </p>
                                
                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="${resetUrl}" style="display: inline-block; padding: 20px 50px; background-color: #d4b5a0; background: linear-gradient(135deg, #d4b5a0, #c9a084); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 700; box-shadow: 0 6px 20px rgba(212, 181, 160, 0.4); text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); border: 2px solid #c9a084;">
                                                🔐 Réinitialiser mon mot de passe
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #fdfbf7; border-left: 4px solid #d4b5a0; border-radius: 4px;">
                                    <p style="color: #866b5d; font-size: 14px; margin: 0 0 10px 0;">
                                        <strong>⏰ Important :</strong> Ce lien expirera dans 1 heure
                                    </p>
                                    <p style="color: #866b5d; font-size: 14px; margin: 0;">
                                        Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
                                    </p>
                                </div>
                                
                                <div style="margin: 30px 0; padding: 15px; background-color: #f0f0f0; border-radius: 8px;">
                                    <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                                        ⚠️ Si le bouton ne fonctionne pas :
                                    </p>
                                    <p style="color: #333; font-size: 13px; margin: 0 0 5px 0;">
                                        Copiez et collez ce lien dans votre navigateur :
                                    </p>
                                    <div style="padding: 10px; background-color: white; border: 2px solid #d4b5a0; border-radius: 4px; margin-top: 10px;">
                                        <p style="color: #d4b5a0; font-size: 14px; word-break: break-all; margin: 0; font-family: monospace; font-weight: 600;">
                                            ${resetUrl}
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                <p style="color: #fff; font-size: 14px; margin: 0 0 10px 0;">
                                    LAIA SKIN INSTITUT
                                </p>
                                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px 0;">
                                    Une peau respectée, une beauté révélée
                                </p>
                                <div style="margin-top: 20px;">
                                    <a href="https://www.instagram.com/laia.skin/" style="color: #d4b5a0; text-decoration: none; margin: 0 10px;">
                                        Instagram
                                    </a>
                                    <span style="color: rgba(255,255,255,0.3);">|</span>
                                    <a href="https://laia-skin-institut-as92.vercel.app" style="color: #d4b5a0; text-decoration: none; margin: 0 10px;">
                                        Site web
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  try {
    // Si pas de clé API configurée, simuler l'envoi
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo_key') {
      console.log('\n📧 SIMULATION D\'ENVOI D\'EMAIL (configurez RESEND_API_KEY pour activer l\'envoi réel)');
      console.log('Destinataire:', email);
      console.log('Lien de réinitialisation:', resetUrl);
      console.log('\n');
      return { success: true, simulated: true };
    }

    // Envoyer l'email réel
    const { data, error } = await getResend().emails.send({
      from: 'LAIA SKIN INSTITUT <contact@laiaskininstitut.fr>',
      to: email,
      subject: '🔐 Réinitialisez votre mot de passe - LAIA SKIN INSTITUT',
      html: htmlContent,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return { success: false, error };
    }

    console.log('✅ Email envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}

interface SendConfirmationEmailParams {
  to: string;
  clientName: string;
  date: string;
  time: string;
  services: string[];
  totalPrice: number;
  reservationId: string;
  notes?: string;
}

export async function sendConfirmationEmail({
  to,
  clientName,
  date,
  time,
  services,
  totalPrice,
  reservationId,
  notes
}: SendConfirmationEmailParams) {
  // Si pas de clé API configurée, simuler l'envoi
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo_key') {
    console.log('\n📧 SIMULATION D\'EMAIL DE CONFIRMATION');
    console.log('Destinataire:', to);
    console.log('Services:', services.join(', '));
    console.log('Date:', date, 'à', time);
    return false;
  }

  try {
    const servicesList = services.join(', ');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de votre réservation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 40px; text-align: center;">
                                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">LAIA SKIN INSTITUT</h1>
                                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Beauté & Bien-être</p>
                              </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                      ✨ Réservation confirmée !
                                  </h2>
                                  
                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                      Bonjour ${clientName},
                                  </p>
                                  
                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                      Votre réservation chez LAIA SKIN INSTITUT est confirmée. Nous avons hâte de vous accueillir !
                                  </p>
                                  
                                  <div style="background-color: #fdfbf7; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
                                      <h3 style="color: #d4b5a0; font-size: 18px; margin: 0 0 15px 0;">📅 Détails de votre rendez-vous</h3>
                                      <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>Date :</strong> ${date}</p>
                                      <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>Heure :</strong> ${time}</p>
                                      <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>Soins :</strong> ${servicesList}</p>
                                      <p style="color: #d4b5a0; font-size: 18px; margin: 15px 0 0 0;"><strong>Total : ${totalPrice}€</strong></p>
                                  </div>
                                  
                                  <div style="background-color: #fff8f3; padding: 20px; border-left: 4px solid #d4b5a0; margin: 0 0 30px 0;">
                                      <h4 style="color: #2c3e50; font-size: 16px; margin: 0 0 10px 0;">📍 Adresse de l'institut</h4>
                                      <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                                          Allée Jean de la Fontaine<br>
                                          92000 Nanterre<br>
                                          <strong>📱 Appelez-moi au 06 83 71 70 50</strong><br>
                                          <strong>quand vous serez arrivé</strong><br>
                                          <em>🚇 À 6 minutes à pied de la gare Nanterre Université</em>
                                      </p>
                                  </div>
                                  
                                  <p style="color: #999; font-size: 13px; margin: 20px 0;">
                                      Pour toute modification ou annulation, merci de nous contacter au moins 24h à l'avance.
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                  <p style="color: #fff; font-size: 14px; margin: 0 0 10px 0;">
                                      À très bientôt !
                                  </p>
                                  <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px 0;">
                                      LAIA SKIN INSTITUT
                                  </p>
                                  <div style="margin-top: 20px;">
                                      <a href="https://www.instagram.com/laia.skin/" style="color: #d4b5a0; text-decoration: none;">
                                          Instagram @laia.skin
                                      </a>
                                  </div>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    // Envoyer l'email au client
    // NOTE: Pour utiliser contact@laia.skininstitut.fr, vous devez d'abord vérifier votre domaine dans Resend
    // Suivez le guide RESEND_CONFIGURATION.md sur votre bureau
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA SKIN INSTITUT <contact@laiaskininstitut.fr>';

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to,
      subject: `✨ Confirmation de votre réservation - ${date} à ${time}`,
      html: htmlContent
    });

    if (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }

    // Envoyer une copie à l'admin
    try {
      const adminNotification = `
        <h2>🔔 Nouvelle réservation confirmée</h2>
        <p><strong>Client:</strong> ${clientName} (${to})</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Heure:</strong> ${time}</p>
        <p><strong>Services:</strong> ${services.join(', ')}</p>
        <p><strong>Total:</strong> ${totalPrice}€</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      `;

      await getResend().emails.send({
        from: fromEmail,
        to: 'contact@laia.skininstitut.fr',
        subject: `🔔 Nouvelle réservation - ${date} à ${time}`,
        html: adminNotification
      });
      console.log('✅ Copie envoyée à contact@laia-skin.fr');
    } catch (adminError) {
      console.error('⚠️ Erreur envoi copie admin:', adminError);
      // On ne bloque pas l'envoi principal si la copie admin échoue
    }

    console.log('✅ Email de confirmation envoyé:', to);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

export async function sendDemoConfirmationEmail({
  email,
  contactName,
  institutName,
  meetingUrl,
  date,
  duration
}: SendDemoConfirmationEmailParams) {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de votre démo LAIA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 40px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">🌸 LAIA BEAUTY</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Logiciel de gestion pour professionnels de la beauté</p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                    🎉 Votre démo est confirmée !
                                </h2>

                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Bonjour ${contactName},
                                </p>

                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                    Merci pour votre intérêt pour LAIA ! Votre démonstration est confirmée pour <strong>${institutName}</strong>.
                                </p>

                                <div style="background: linear-gradient(135deg, #f3e7ff, #fce7f3); padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border-left: 4px solid #9333ea;">
                                    <h3 style="color: #9333ea; font-size: 18px; margin: 0 0 15px 0;">📅 Détails de votre démonstration</h3>
                                    <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>📆 Date :</strong> ${formattedDate}</p>
                                    <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>⏱️ Durée :</strong> ${duration} minutes</p>
                                    <p style="color: #666; font-size: 15px; margin: 8px 0;"><strong>💼 Institut :</strong> ${institutName}</p>
                                </div>

                                <!-- Lien Jitsi -->
                                <div style="background-color: #fff8f3; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; text-align: center;">
                                    <h4 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px 0;">🎥 Rejoindre la visioconférence</h4>
                                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                                        La démonstration se fera en visioconférence via <strong>Jitsi Meet</strong>.<br>
                                        Aucune inscription requise, cliquez simplement sur le bouton ci-dessous à l'heure du rendez-vous :
                                    </p>
                                    <a href="${meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                        🎥 Rejoindre la démo
                                    </a>
                                    <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
                                        Lien direct : <a href="${meetingUrl}" style="color: #9333ea; word-break: break-all;">${meetingUrl}</a>
                                    </p>
                                </div>

                                <!-- Conseils -->
                                <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; border-radius: 8px; margin: 0 0 30px 0;">
                                    <h4 style="color: #047857; font-size: 16px; margin: 0 0 10px 0;">💡 Conseils pour la démo</h4>
                                    <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                        <li>Préparez vos questions à l'avance</li>
                                        <li>Assurez-vous d'avoir une connexion internet stable</li>
                                        <li>Nous vous montrerons toutes les fonctionnalités principales</li>
                                        <li>N'hésitez pas à demander une démonstration personnalisée selon vos besoins</li>
                                    </ul>
                                </div>

                                <p style="color: #999; font-size: 13px; margin: 20px 0 0 0;">
                                    Pour toute question ou modification, répondez simplement à cet email.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                <p style="color: #fff; font-size: 14px; margin: 0 0 10px 0;">
                                    À très bientôt !
                                </p>
                                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px 0;">
                                    L'équipe LAIA Connect
                                </p>
                                <div style="margin-top: 20px;">
                                    <a href="https://laia-beauty.com" style="color: #9333ea; text-decoration: none; margin: 0 10px;">
                                        Site web
                                    </a>
                                    <span style="color: rgba(255,255,255,0.3);">|</span>
                                    <a href="mailto:contact@laia-beauty.com" style="color: #9333ea; text-decoration: none; margin: 0 10px;">
                                        Contact
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  try {
    // Si pas de clé API configurée, simuler l'envoi
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo_key') {
      console.log('\n📧 SIMULATION D\'EMAIL DE CONFIRMATION DE DÉMO');
      console.log('Destinataire:', email);
      console.log('Institut:', institutName);
      console.log('Date:', formattedDate);
      console.log('Lien Jitsi:', meetingUrl);
      console.log('\n');
      return { success: true, simulated: true };
    }

    // Envoyer l'email réel
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA Connect <demo@laia-beauty.com>';

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: email,
      subject: `🎉 Votre démo LAIA est confirmée - ${formattedDate}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return { success: false, error };
    }

    console.log('✅ Email de confirmation de démo envoyé:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur envoi email de démo:', error);
    return { success: false, error };
  }
}