/**
 * Script pour tester l'envoi d'email de bienvenue
 */

const { sendWelcomeEmail } = require('./src/lib/onboarding-emails')

async function testEmail() {
  console.log('📧 Test envoi email de bienvenue...\n')

  try {
    await sendWelcomeEmail({
      recipientEmail: 'celia.ivorra95@hotmail.fr',
      recipientName: 'Celia Ivorra',
      organizationName: 'Institut Beauté Celia',
      tempPassword: 'Celia2025!',
      plan: 'SOLO',
      invoicePdfBuffer: undefined,
      contractPdfBuffer: undefined
    })

    console.log('✅ Email envoyé avec succès !')
    console.log('')
    console.log('📬 Vérifiez votre boîte mail : celia.ivorra95@hotmail.fr')

  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message)
    console.error(error)
  }
}

testEmail()
