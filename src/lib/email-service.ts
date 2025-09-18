// Service d'envoi d'email simple avec template HTML
// Utilise l'API Web native (nécessite un serveur SMTP configuré ou un service tiers)

export interface EmailData {
  to: string;
  clientName: string;
  date: string;
  time: string;
  services: string[];
  totalPrice: number;
  reservationId: string;
}

export async function sendConfirmationEmail(data: EmailData): Promise<boolean> {
  console.log('📧 Envoi email de confirmation à:', data.to);
  // Vérifier si EmailJS est configuré
  if (process.env.EMAILJS_PUBLIC_KEY) {
    const { sendEmailWithEmailJS } = await import('./emailjs-service');
    return sendEmailWithEmailJS(data);
  }
  
  // Vérifier si SendGrid est configuré
  if (process.env.SENDGRID_API_KEY) {
    const { sendEmailWithSendGrid } = await import('./sendgrid-service');
    return sendEmailWithSendGrid(data);
  }
  
  try {
    // Template HTML pour l'email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .info-box { background: #fdfbf7; border-left: 4px solid #d4b5a0; padding: 15px; margin: 20px 0; }
    .address-box { background: #fff8f0; border: 2px solid #d4b5a0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #d4b5a0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 5px; }
    .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Confirmation de réservation</h1>
      <p>LAIA SKIN INSTITUT</p>
    </div>
    
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      <p>Votre rendez-vous est confirmé ! J'ai hâte de vous accueillir dans mon institut.</p>
      
      <div class="info-box">
        <h3>📅 Détails de votre rendez-vous</h3>
        <p><strong>Date :</strong> ${data.date}</p>
        <p><strong>Heure :</strong> ${data.time}</p>
        <p><strong>Soins réservés :</strong></p>
        <ul>${data.services.map(s => `<li>${s}</li>`).join('')}</ul>
        <p><strong>Montant total :</strong> ${data.totalPrice}€</p>
        <p><small>Paiement en espèces sur place</small></p>
      </div>
      
      <div class="address-box">
        <h3>📍 Adresse de l'institut</h3>
        <p><strong>LAIA SKIN INSTITUT</strong><br>
        5 allée Jean de la Fontaine<br>
        92000 Nanterre</p>
        <p style="background: #d4b5a0; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">
          <strong>🏢 Bâtiment 5 - 2ème étage - Porte 523</strong>
        </p>
        <p>🚇 À 6 minutes à pied de la gare Nanterre Université</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://maps.google.com/?q=5+allée+Jean+de+la+Fontaine+92000+Nanterre" class="button">
          📍 Voir sur Google Maps
        </a>
        <a href="https://wa.me/33683717050" class="button" style="background: #25D366;">
          💬 WhatsApp
        </a>
      </div>
      
      <div class="info-box">
        <h3>ℹ️ Informations importantes</h3>
        <ul>
          <li>Merci d'arriver 5 minutes avant votre rendez-vous</li>
          <li>Annulation gratuite jusqu'à 24h avant</li>
          <li>Pour toute modification : contactez-moi sur WhatsApp ou Instagram @laia.skin</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Une peau respectée, une beauté révélée</p>
      <p>📱 WhatsApp : 06 83 71 70 50 | 📧 contact@laiaskin.fr</p>
      <p style="margin-top: 10px;">
        <a href="https://www.instagram.com/laia.skin/" style="color: #d4b5a0;">Instagram</a> | 
        <a href="https://www.facebook.com/profile.php?id=61578944046472" style="color: #d4b5a0;">Facebook</a> | 
        <a href="https://www.tiktok.com/@laiaskin" style="color: #d4b5a0;">TikTok</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Créer le contenu texte simple (fallback)
    const textContent = `
Confirmation de réservation - LAIA SKIN INSTITUT

Bonjour ${data.clientName},

Votre rendez-vous est confirmé !

DÉTAILS DU RENDEZ-VOUS :
Date : ${data.date}
Heure : ${data.time}
Soins : ${data.services.join(', ')}
Montant : ${data.totalPrice}€

ADRESSE :
LAIA SKIN INSTITUT
5 allée Jean de la Fontaine, 92000 Nanterre
Bâtiment 5 - 2ème étage - Porte 523
(6 min à pied de la gare Nanterre Université)

Google Maps : https://maps.google.com/?q=5+allée+Jean+de+la+Fontaine+92000+Nanterre

À très bientôt !
Laïa

WhatsApp : 06 12 34 56 78
Instagram : @laia.skin`;

    // Pour l'instant, on simule l'envoi (à remplacer par un vrai service)
    console.log('📧 Email de confirmation préparé pour:', data.to);
    console.log('Contenu HTML:', htmlContent.substring(0, 200) + '...');
    
    // Stocker dans localStorage pour simulation
    if (typeof window !== 'undefined') {
      const emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]');
      emailHistory.push({
        to: data.to,
        subject: `Confirmation RDV - ${data.date} à ${data.time}`,
        sentAt: new Date().toISOString(),
        type: 'confirmation'
      });
      localStorage.setItem('emailHistory', JSON.stringify(emailHistory));
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

// Fonction pour envoyer l'email de rappel
export async function sendReminderEmail(data: EmailData): Promise<boolean> {
  // Template similaire mais pour le rappel
  const subject = `Rappel : Votre RDV demain à ${data.time}`;
  console.log('📧 Email de rappel préparé:', subject);
  return true;
}

// Fonction pour envoyer l'email d'annulation
export async function sendCancellationEmail(data: Partial<EmailData>): Promise<boolean> {
  const subject = `Annulation confirmée - LAIA SKIN INSTITUT`;
  console.log('📧 Email d\'annulation préparé:', subject);
  return true;
}