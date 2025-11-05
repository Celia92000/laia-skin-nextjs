/**
 * Script pour tester l'envoi d'email directement (ESM)
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Charger les variables d'environnement
import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('📧 Test envoi email de bienvenue (direct)...\n')

// Vérifier les variables d'env
console.log('🔍 Vérification variables d\'environnement:')
console.log('  - BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Défini' : '❌ Manquant')
console.log('  - BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || '❌ Manquant')
console.log('  - BREVO_FROM_NAME:', process.env.BREVO_FROM_NAME || '❌ Manquant')
console.log('  - SUPER_ADMIN_EMAIL:', process.env.SUPER_ADMIN_EMAIL || '❌ Manquant')
console.log('')

if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY non configuré dans .env.local')
  process.exit(1)
}

// Tester un appel direct à l'API Brevo
const SibApiV3Sdk = require('sib-api-v3-sdk')

const defaultClient = SibApiV3Sdk.ApiClient.instance
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

sendSmtpEmail.subject = "Test Email LAIA Connect"
sendSmtpEmail.htmlContent = "<html><body><h1>Test Email</h1><p>Ceci est un test d'envoi depuis le webhook.</p></body></html>"
sendSmtpEmail.sender = {
  name: process.env.BREVO_FROM_NAME || "LAIA Connect",
  email: process.env.BREVO_FROM_EMAIL || "contact@laiaconnect.fr"
}
sendSmtpEmail.to = [{ email: "celia.ivorra95@hotmail.fr", name: "Celia Ivorra" }]

console.log('📤 Envoi email de test...')

try {
  const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
  console.log('✅ Email envoyé avec succès!')
  console.log('   Message ID:', data.messageId)
  console.log('')
  console.log('📬 Vérifiez votre boîte mail : celia.ivorra95@hotmail.fr')
} catch (error) {
  console.error('❌ Erreur envoi email:', error.message)
  if (error.response) {
    console.error('   Status:', error.response.status)
    console.error('   Body:', JSON.stringify(error.response.body, null, 2))
  }
}
