import { config } from 'dotenv'
import { sendEmail } from './src/lib/brevo'

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' })

async function test() {
  console.log('🔑 BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Chargée ✅' : 'Manquante ❌')
  try {
    console.log('🚀 Test envoi email via Brevo...')

    const result = await sendEmail({
      to: 'contact@laiaskininstitut.fr', // Envoi vers votre email pour tester
      subject: '🎉 Test LAIA Connect via Brevo',
      html: `
        <h1>Ça marche !</h1>
        <p>Email envoyé depuis <strong>LAIA Connect</strong> via Brevo.</p>
        <p>Configuration réussie ! ✅</p>
        <hr>
        <p style="color: gray; font-size: 12px;">
          Envoyé depuis laiaconnect.fr<br>
          Provider: Brevo
        </p>
      `
    })

    console.log('✅ Email envoyé avec succès !')
    console.log('Message ID:', result.messageId)
  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    console.error('Détails:', error.response?.body || error)
  }
}

test()
