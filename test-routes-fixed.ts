const routes = [
  '/api/gallery',
  '/api/services/hydro-naissance/stats'
]

async function testRoutes() {
  console.log('=== TEST DES ROUTES CORRIGEES ===\n')
  
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3001${route}`)
      const status = res.status
      const icon = status === 200 ? '✅' : status === 500 ? '❌' : '⚠️'
      console.log(`${icon} ${status} ${route}`)
      
      if (status === 200) {
        const data = await res.json()
        console.log('   Response:', JSON.stringify(data).substring(0, 100) + '...')
      }
    } catch (error: any) {
      console.log(`💥 ERROR ${route}:`, error.message)
    }
  }
}

testRoutes()
