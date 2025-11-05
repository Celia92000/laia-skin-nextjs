/**
 * Script pour tester Resend directement
 */

import { Resend } from 'resend'
import { config } from 'dotenv'

config({ path: '.env.local' })

console.log('📧 Test envoi email avec Resend...\n')
console.log('🔍 RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Défini' : '❌ Manquant')
console.log('🔍 RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Manquant')
console.log('')

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY manquant')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

try {
  console.log('📤 Envoi email de test...')

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
    to: ['celia.ivorra95@hotmail.fr'],
    subject: 'Test Email LAIA Connect - Onboarding',
    html: `
      <html>
        <body>
          <h1>🎉 Test Email LAIA Connect</h1>
          <p>Bonjour Celia,</p>
          <p>Ceci est un email de test pour vérifier que l'envoi fonctionne correctement depuis le webhook d'onboarding.</p>
          <p>Si vous recevez cet email, cela signifie que Resend fonctionne ! ✅</p>
          <br/>
          <p>Cordialement,<br/>L'équipe LAIA Connect</p>
        </body>
      </html>
    `
  })

  if (error) {
    console.error('❌ Erreur Resend:', error)
  } else {
    console.log('✅ Email envoyé avec succès!')
    console.log('   Message ID:', data.id)
    console.log('')
    console.log('📬 Vérifiez votre boîte mail : celia.ivorra95@hotmail.fr')
    console.log('   (peut prendre quelques secondes/minutes)')
  }
} catch (error) {
  console.error('❌ Erreur:', error.message)
  console.error(error)
}
