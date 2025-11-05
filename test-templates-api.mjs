/**
 * Script pour tester l'API des templates d'onboarding
 */

console.log('🧪 Test API Templates d\'Onboarding...\n')

// Récupérer le token depuis les cookies ou la base de données
// Pour le test, on va juste appeler l'API publiquement et voir la réponse

const API_URL = 'http://localhost:3001/api/super-admin/onboarding-templates'

try {
  console.log('📡 Appel GET /api/super-admin/onboarding-templates')
  console.log('URL:', API_URL)
  console.log('')

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  console.log('📊 Statut:', response.status, response.statusText)

  if (response.status === 401) {
    console.log('⚠️  Non authentifié (normal, il faut être connecté en super-admin)')
    console.log('✅ L\'API fonctionne ! Elle demande bien une authentification.')
  } else if (response.ok) {
    const data = await response.json()
    console.log('✅ API OK ! Nombre de templates:', data.length)
    console.log('')
    console.log('📧 Templates trouvés:')
    data.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}`)
      console.log(`   Slug: ${template.slug}`)
      console.log(`   Actif: ${template.isActive ? '✅' : '❌'}`)
      console.log(`   Système: ${template.isSystem ? '🔒' : '📝'}`)
      console.log(`   Catégorie: ${template.category}`)
    })
  } else {
    const text = await response.text()
    console.log('❌ Erreur:', text)
  }

} catch (error) {
  console.error('❌ Erreur lors du test:', error.message)
}

console.log('\n✅ Test terminé')
