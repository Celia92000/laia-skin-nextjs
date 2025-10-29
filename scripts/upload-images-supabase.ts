// Script pour documenter les URLs des images dans Supabase
// Les images doivent être uploadées manuellement via le dashboard Supabase

const imageUrls = {
  services: [
    {
      name: 'BB Glow',
      localPath: '/images/bb-glow.jpg',
      supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/bb-glow.jpg'
    },
    {
      name: 'Hydro Cleaning',
      localPath: '/images/hydro-cleaning.jpg',
      supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/hydro-cleaning.jpg'
    },
    {
      name: 'Renaissance',
      localPath: '/images/renaissance.jpg',
      supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/renaissance.jpg'
    },
    {
      name: 'LED Thérapie',
      localPath: '/images/led-therapie.jpg',
      supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/led-therapie.jpg'
    },
    {
      name: 'Hydro Naissance',
      localPath: '/images/hydro-naissance.jpg',
      supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/hydro-naissance.jpg'
    }
  ],
  logo: {
    name: 'Logo Laia Skin',
    localPath: '/logo-laia-skin.png',
    supabaseUrl: 'https://zsxweurvtsrdgehtadwa.supabase.co/storage/v1/object/public/service-images/logo-laia-skin.png'
  }
};

console.log('📦 INSTRUCTIONS POUR UPLOADER LES IMAGES DANS SUPABASE:\n');
console.log('1. Allez sur: https://supabase.com/dashboard/project/zsxweurvtsrdgehtadwa/storage/buckets');
console.log('2. Créez un bucket "service-images" (public)');
console.log('3. Uploadez les images suivantes depuis public/images/:\n');

imageUrls.services.forEach(img => {
  console.log(`   - ${img.name}: ${img.localPath}`);
});
console.log(`   - ${imageUrls.logo.name}: ${imageUrls.logo.localPath}`);

console.log('\n4. Une fois uploadées, les URLs seront:');
imageUrls.services.forEach(img => {
  console.log(`   ${img.name}: ${img.supabaseUrl}`);
});
console.log(`   ${imageUrls.logo.name}: ${imageUrls.logo.supabaseUrl}`);

console.log('\n✅ Les images sont déjà disponibles localement dans le projet!');
console.log('   Elles sont pushées sur GitHub et déployées sur Vercel.');

export { imageUrls };