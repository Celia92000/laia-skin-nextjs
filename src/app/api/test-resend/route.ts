import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || 'dummy');
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key') {
      return NextResponse.json({ 
        error: 'Resend non configuré',
        message: 'Ajoutez RESEND_API_KEY dans les variables Vercel'
      }, { status: 400 });
    }

    // Envoyer un email de test
    const { data, error } = await resend.emails.send({
      from: 'LAIA SKIN Test <onboarding@resend.dev>',
      to: ['delivered@resend.dev'], // Email de test Resend
      subject: 'Test LAIA SKIN - Resend fonctionne !',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; color: white;">
            <h1>✅ Test Resend Réussi !</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Configuration validée pour LAIA SKIN Institut</h2>
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
        from: 'onboarding@resend.dev',
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