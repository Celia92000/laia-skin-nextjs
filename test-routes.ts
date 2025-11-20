const routes = [
  '/',
  '/api/services',
  '/api/products', 
  '/api/formations',
  '/api/public/config',
  '/api/organization/current',
  '/api/gallery',
  '/services/hydro-naissance',
  '/services/hydro-cleaning',
  '/api/services/hydro-naissance',
  '/api/services/hydro-naissance/stats',
  '/prestations',
  '/produits',
  '/formations',
  '/reseaux-sociaux',
  '/a-propos',
  '/contact'
]

async function testRoutes() {
  console.log('=== TEST DES ROUTES ===\n')
  
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3001${route}`)
      const status = res.status
      const icon = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️'
      console.log(`${icon} ${status} ${route}`)
    } catch (error) {
      console.log(`💥 ERROR ${route}`)
    }
  }
}

testRoutes()
