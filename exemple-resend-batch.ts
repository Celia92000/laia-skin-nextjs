// Exemple d'envoi d'emails en batch pour LAIA SKIN
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

// Exemple : Envoyer plusieurs emails d'anniversaire en une fois
async function envoyerEmailsAnniversaires() {
  // Exemple de clients ayant leur anniversaire aujourd'hui
  const clientsAnniversaire = [
    { email: 'marie.dupont@email.com', nom: 'Marie' },
    { email: 'sophie.martin@email.com', nom: 'Sophie' },
    { email: 'julie.bernard@email.com', nom: 'Julie' }
  ];

  // Créer un batch d'emails
  const emails = clientsAnniversaire.map(client => ({
    from: 'LAIA SKIN Institut <onboarding@resend.dev>',
    to: [client.email],
    subject: `🎂 Joyeux anniversaire ${client.nom} ! -30% offert`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; color: white;">
          <h1>🎉 Joyeux anniversaire ${client.nom} !</h1>
        </div>
        <div style="padding: 30px;">
          <p>Chère ${client.nom},</p>
          <p>Toute l'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire !</p>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #d4b5a0;">🎁 Votre cadeau</h2>
            <p style="font-size: 24px; color: #333;"><strong>-30% sur votre prochain soin</strong></p>
            <p>Code promo : <span style="background: #d4b5a0; color: white; padding: 5px 10px; border-radius: 5px;">ANNIV${new Date().getMonth() + 1}2025</span></p>
            <p><small>Valable tout le mois</small></p>
          </div>
          
          <p>Prenez soin de vous, vous le méritez !</p>
          <p>À très bientôt,<br>Laïa</p>
        </div>
      </div>
    `
  }));

  try {
    // Envoyer tous les emails en une seule requête
    const data = await resend.batch.send(emails);
    console.log('✅ Emails d\'anniversaire envoyés:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exemple : Envoyer des demandes d'avis 3 jours après le RDV
async function envoyerDemandesAvis() {
  // Clients qui ont eu un RDV il y a 3 jours
  const clientsAvis = [
    { email: 'client1@email.com', nom: 'Isabelle', soin: 'HydroNaissance' },
    { email: 'client2@email.com', nom: 'Caroline', soin: 'BB Glow' }
  ];

  const emails = clientsAvis.map(client => ({
    from: 'LAIA SKIN Institut <onboarding@resend.dev>',
    to: [client.email],
    subject: `${client.nom}, votre avis compte pour nous ⭐`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour ${client.nom},</h2>
        <p>J'espère que vous êtes satisfaite de votre soin ${client.soin} !</p>
        <p>Votre avis est précieux pour nous améliorer.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://laiaskin.fr/avis" style="background: #d4b5a0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px;">
            Donner mon avis
          </a>
        </div>
        
        <p>Merci de votre confiance,<br>Laïa</p>
      </div>
    `
  }));

  try {
    const data = await resend.batch.send(emails);
    console.log('✅ Demandes d\'avis envoyées:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Pour tester
async function test() {
  console.log('🔧 Test envoi batch Resend...');
  
  // Décommenter pour tester :
  // await envoyerEmailsAnniversaires();
  // await envoyerDemandesAvis();
  
  console.log('💡 Décommentez les fonctions pour tester');
}

test();