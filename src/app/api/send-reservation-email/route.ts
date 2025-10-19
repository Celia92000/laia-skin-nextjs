import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getSiteConfig } from '@/lib/config-service';

export async function POST(request: NextRequest) {
  // Récupérer la configuration du site
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const email = config.email || 'contact@institut.fr';

  try {
    const { to, reservation } = await request.json();

    // Validation
    if (!to || !reservation) {
      return NextResponse.json({
        success: false,
        error: 'Champs obligatoires manquants: to, reservation'
      }, { status: 400 });
    }

    // Extraire les données de la réservation
    // Si reservation.services est déjà un string simple (slug), on le met dans un array
    let services = [];
    try {
      if (!reservation.services) {
        services = [];
      } else if (typeof reservation.services === 'string') {
        // Si c'est un JSON array valide
        if (reservation.services.startsWith('[')) {
          services = JSON.parse(reservation.services);
        } else {
          // Si c'est juste un slug de service
          services = [reservation.services];
        }
      } else if (Array.isArray(reservation.services)) {
        services = reservation.services;
      }
    } catch (e) {
      console.error('Erreur lors du parsing des services, utilisation du string directement', e);
      services = reservation.services ? [reservation.services] : [];
    }

    let packages: Record<string, any> = {};
    try {
      packages = typeof reservation.packages === 'string' ? JSON.parse(reservation.packages || '{}') : (reservation.packages || {});
    } catch (e) {
      console.error('Erreur lors du parsing des packages', e);
      packages = {};
    }

    let options = [];
    try {
      options = typeof reservation.options === 'string' ? JSON.parse(reservation.options || '[]') : (reservation.options || []);
    } catch (e) {
      console.error('Erreur lors du parsing des options', e);
      options = [];
    }
    
    // Formater la date
    const date = new Date(reservation.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Liste des services avec leurs icônes
    const serviceMap: { [key: string]: { name: string; icon: string } } = {
      'hydro-naissance': { name: "LAIA Hydro'Naissance", icon: '👑' },
      'hydro-cleaning': { name: "LAIA Hydro'Cleaning", icon: '💧' },
      'renaissance': { name: 'LAIA Renaissance', icon: '✨' },
      'bb-glow': { name: 'BB Glow', icon: '🌟' },
      'led-therapie': { name: 'LED Thérapie', icon: '💡' }
    };

    const servicesHTML = services.map((serviceId: string) => {
      const service = serviceMap[serviceId] || { name: serviceId, icon: '💆' };
      const packageType = packages[serviceId];
      let packageLabel = '';
      if (packageType === 'forfait') {
        packageLabel = ' <span style="color: #d4b5a0; font-size: 12px;">(Forfait 4 séances)</span>';
      } else if (packageType === 'abonnement') {
        packageLabel = ' <span style="color: #9333ea; font-size: 12px;">(Abonnement mensuel)</span>';
      }
      return `<div style="padding: 8px 0;">
        <span style="font-size: 20px; margin-right: 8px;">${service.icon}</span>
        <strong>${service.name}</strong>${packageLabel}
      </div>`;
    }).join('');

    // Options complémentaires
    const optionsHTML = options.length > 0 ? `
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Options ajoutées :</strong></p>
        ${options.map((opt: string) => {
          const optionName = opt === 'bb-glow' ? 'BB Glow' : 'LED Thérapie';
          const icon = opt === 'bb-glow' ? '🌟' : '💡';
          return `<div style="padding: 4px 0;"><span>${icon}</span> ${optionName} (+50€)</div>`;
        }).join('')}
      </div>` : '';

    // Template HTML complet et professionnel
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor}, #c9a084); padding: 50px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 2px;">${siteName.toUpperCase()}</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px; letter-spacing: 1px;">${config.siteTagline || 'Beauté & Bien-être'}</p>
            </td>
          </tr>
          
          <!-- Confirmation Success -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; line-height: 80px; font-size: 40px; color: white; margin-bottom: 20px;">
                ✓
              </div>
              <h2 style="color: #2c3e50; font-size: 28px; margin: 0 0 10px 0; font-weight: 400;">
                Réservation Confirmée !
              </h2>
              <p style="color: #666; font-size: 16px; margin: 0;">
                Bonjour ${reservation.user?.name || 'Cliente'},
              </p>
              <p style="color: #666; font-size: 16px; margin: 10px 0;">
                Nous avons le plaisir de confirmer votre rendez-vous
              </p>
            </td>
          </tr>
          
          <!-- Détails du rendez-vous -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background: linear-gradient(to right, #fdfbf7, #fff8f3); padding: 25px; border-radius: 10px; border-left: 4px solid #d4b5a0;">
                <h3 style="color: #d4b5a0; font-size: 20px; margin: 0 0 20px 0; display: flex; align-items: center;">
                  📅 Votre Rendez-vous
                </h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #2c3e50; font-size: 15px;">📆 Date :</strong>
                      <span style="color: #666; font-size: 15px; margin-left: 10px;">${date}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #2c3e50; font-size: 15px;">🕐 Heure :</strong>
                      <span style="color: #666; font-size: 15px; margin-left: 10px;">${reservation.time}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #2c3e50; font-size: 15px;">💆 Soins réservés :</strong>
                      <div style="margin-top: 10px; padding-left: 20px;">
                        ${servicesHTML}
                        ${optionsHTML}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 0 10px 0; border-top: 2px solid #d4b5a0; margin-top: 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #2c3e50; font-size: 18px;">💰 Total à régler :</strong>
                        <span style="color: #d4b5a0; font-size: 24px; font-weight: bold;">${reservation.totalPrice}€</span>
                      </div>
                      <p style="color: #999; font-size: 13px; margin: 5px 0 0 0; text-align: center;">
                        💵 Paiement en espèces uniquement sur place
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Adresse avec mise en valeur -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background: #fff8f3; padding: 25px; border-radius: 10px; border: 2px solid #d4b5a0;">
                <h4 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px 0; display: flex; align-items: center;">
                  📍 Localisation
                </h4>
                <p style="color: #333; font-size: 15px; line-height: 1.8; margin: 0;">
                  <strong>${siteName.toUpperCase()}</strong><br>
                  ${fullAddress}
                </p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid ${primaryColor};">
                  <p style="color: ${primaryColor}; font-size: 14px; margin: 0; line-height: 1.8;">
                    <strong>📱 Appelez-moi au ${phone}</strong><br>
                    <strong>quand vous serez arrivé</strong>
                  </p>
                </div>
                <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                  🚇 <strong>6 minutes à pied</strong> de la gare Nanterre Université
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Boutons d'action -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/33683717050" style="display: inline-block; padding: 15px 30px; background: #25d366; color: white; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; margin: 0 10px;">
                      💬 WhatsApp
                    </a>
                    <a href="https://www.instagram.com/laia.skin/" style="display: inline-block; padding: 15px 30px; background: #E4405F; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; margin: 0 10px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                      📸 Instagram
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Informations importantes -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h5 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">
                  ℹ️ Informations importantes
                </h5>
                <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin: 5px 0;">Merci d'arriver 5 minutes avant votre rendez-vous</li>
                  <li style="margin: 5px 0;">Paiement uniquement en espèces</li>
                  <li style="margin: 5px 0;">Pensez à venir démaquillée</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2c3e50; padding: 40px; text-align: center;">
              <p style="color: #fff; font-size: 16px; margin: 0 0 10px 0;">
                Au plaisir de vous accueillir !
              </p>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 20px 0;">
                ${siteName.toUpperCase()}
              </p>
              <div style="margin-top: 25px;">
                ${config.instagram ? `<a href="${config.instagram}" style="color: ${primaryColor}; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  Instagram ${config.instagram.split('/').pop() ? '@' + config.instagram.split('/').pop() : ''}
                </a>
                <span style="color: rgba(255,255,255,0.3);">|</span>` : ''}
                ${config.whatsapp ? `<a href="https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}" style="color: ${primaryColor}; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  WhatsApp
                </a>` : ''}
              </div>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 20px 0 0 0;">
                © ${new Date().getFullYear()} ${siteName.toUpperCase()} - Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Vérifier si Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
      console.log('📧 Email de confirmation (mode simulation)');
      console.log('Destinataire:', to);
      console.log('Réservation:', { date, time: reservation.time, services, total: reservation.totalPrice });
      return NextResponse.json({ 
        success: true,
        simulated: true,
        message: 'Email simulé (configurez RESEND_API_KEY pour activer l\'envoi)'
      });
    }

    // Envoyer l'email avec Resend
    const { data, error} = await getResend().emails.send({
      from: `${siteName} <${email}>`,
      to: [to],
      subject: `✨ Confirmation - RDV du ${date} à ${reservation.time}`,
      html: htmlContent,
      text: `Confirmation de votre réservation chez ${siteName}\n\nDate: ${date}\nHeure: ${reservation.time}\nTotal: ${reservation.totalPrice}€\n\nAdresse: ${fullAddress}\n📱 Appelez-moi au ${phone} quand vous serez arrivé\n\nÀ très bientôt !`
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('✅ Email de confirmation envoyé:', to);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}