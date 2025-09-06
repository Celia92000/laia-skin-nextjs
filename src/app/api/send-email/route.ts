import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, reservation } = await request.json();

    const services = {
      "hydro-naissance": "Hydro'Naissance",
      "hydro": "Hydro'Cleaning",
      "renaissance": "Renaissance",
      "bbglow": "BB Glow",
      "led": "LED Thérapie"
    };

    const date = new Date(reservation.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const servicesList = JSON.parse(reservation.services)
      .map((s: string) => services[s as keyof typeof services])
      .join(', ');

    // Template d'email HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
            .info-box { background: #fdfbf7; padding: 20px; border-left: 4px solid #d4b5a0; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #d4b5a0; color: white; text-decoration: none; border-radius: 25px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .address { background: #f8f6f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ Réservation Confirmée !</h1>
                <p style="margin: 0;">Laia Skin Institut</p>
            </div>
            
            <div class="content">
                <p>Bonjour ${reservation.user.name},</p>
                
                <p>Nous avons le plaisir de vous confirmer votre réservation chez <strong>Laia Skin Institut</strong>.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">📅 Détails de votre rendez-vous</h3>
                    <p><strong>Date :</strong> ${date}</p>
                    <p><strong>Heure :</strong> ${reservation.time}</p>
                    <p><strong>Soins réservés :</strong> ${servicesList}</p>
                    <p><strong>Durée estimée :</strong> 1h30</p>
                    <p><strong>Prix total :</strong> ${reservation.totalPrice}€</p>
                    <p style="color: #666; font-size: 14px;">💶 Paiement en espèces sur place</p>
                </div>
                
                <div class="address">
                    <h3 style="margin-top: 0;">📍 Adresse de l'institut</h3>
                    <p style="margin: 5px 0;"><strong>Laia Skin Institut</strong></p>
                    <p style="margin: 5px 0;">5 allée Jean de la Fontaine</p>
                    <p style="margin: 5px 0;">92000 Nanterre</p>
                    <p style="margin: 5px 0;"><strong>Bâtiment 5, 2ème étage, Porte 523</strong></p>
                    <p style="margin: 10px 0; color: #666;">🚇 À 6 minutes à pied de la gare de Nanterre Université</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h3>Besoin de modifier votre rendez-vous ?</h3>
                    <a href="https://wa.me/33612345678" class="button" style="background: #25D366;">💬 WhatsApp</a>
                    <a href="https://www.instagram.com/laiaskin" class="button" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">📷 Instagram</a>
                </div>
                
                <div style="background: #fef5e7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0;"><strong>⚠️ Politique d'annulation :</strong></p>
                    <p style="margin: 5px 0;">Annulation gratuite jusqu'à 24h avant le rendez-vous. Passé ce délai, 50% du montant sera retenu.</p>
                </div>
                
                <p style="margin-top: 30px;">Nous avons hâte de vous accueillir et de prendre soin de vous !</p>
                
                <p>À très bientôt,<br>
                <strong>Laia</strong><br>
                Laia Skin Institut</p>
            </div>
            
            <div class="footer">
                <p>Laia Skin Institut - Institut de beauté premium</p>
                <p>5 allée Jean de la Fontaine, 92000 Nanterre</p>
                <p>Suivez-nous sur Instagram : @laiaskin</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Ici, vous devriez intégrer un service d'envoi d'email comme SendGrid, Mailgun, etc.
    // Pour l'instant, on simule l'envoi
    console.log('Email envoyé à:', to);
    console.log('Sujet:', subject);
    console.log('Contenu HTML généré');

    // Dans un environnement de production, vous utiliseriez quelque chose comme :
    // await sendgrid.send({
    //   to,
    //   from: 'noreply@laiaskin.com',
    //   subject,
    //   html: htmlContent
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Email de confirmation envoyé',
      preview: 'Pour activer l\'envoi réel, configurez un service d\'email (SendGrid, Mailgun, etc.)'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}