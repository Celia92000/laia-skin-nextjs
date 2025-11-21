import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getSiteConfig } from '@/lib/config-service';

export async function GET() {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';


  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key') {
      return NextResponse.json({
        error: 'Resend non configuré',
        message: 'Ajoutez RESEND_API_KEY dans les variables Vercel'
      }, { status: 400 });
    }

    // Envoyer un email de test
    const { data, error } = await getResend().emails.send({
      from: '${siteName} Test <${email}>',
      to: ['delivered@resend.dev'], // Email de test Resend
      subject: 'Test ${siteName} - Resend fonctionne !',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${primaryColor}, #c9a084); padding: 30px; text-align: center; color: white;">
            <h1>✅ Test Resend Réussi !</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Configuration validée pour ${siteName}</h2>
            <p>Les emails automatiques sont maintenant opérationnels :</p>
            <ul>
              <li>✅ Confirmations de réservation</li>
              <li>✅ Demandes d'avis J+3</li>
              <li>✅ Messages d'anniversaire</li>
            </ul>
            <p style="color: #666;">Test effectué le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `
    });

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur Resend',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Resend fonctionne parfaitement !',
      emailId: data?.id,
      details: {
        from: '${email}',
        to: 'delivered@resend.dev',
        status: 'Email envoyé avec succès'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}