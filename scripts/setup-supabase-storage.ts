import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = 'https://zsxweurvtsrdgehtadwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHdldXJ2dHNyZGdlaHRhZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzg0MjMsImV4cCI6MjA3MzIxNDQyM30.u-k1rK9n-ld0VIDVaSB8OnnvCMxTQVMzUNbrJFqcqrg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupStorage() {
  console.log('🚀 Configuration du stockage Supabase...');

  try {
    // Créer le bucket s'il n'existe pas
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('Erreur lors de la liste des buckets:', listError);
      return;
    }

    const serviceImagesBucket = buckets?.find(b => b.name === 'service-images');

    if (!serviceImagesBucket) {
      const { data, error } = await supabase
        .storage
        .createBucket('service-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });

      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        return;
      }

      console.log('✅ Bucket "service-images" créé avec succès');
    } else {
      console.log('ℹ️ Bucket "service-images" existe déjà');
    }

    // Liste des images à uploader
    const images = [
      { name: 'bb-glow.jpg', displayName: 'BB Glow' },
      { name: 'hydro-cleaning.jpg', displayName: 'Hydro Cleaning' },
      { name: 'hydro-naissance.jpg', displayName: 'Hydro Naissance' },
      { name: 'renaissance.jpg', displayName: 'Renaissance' },
      { name: 'led-therapie.jpg', displayName: 'LED Thérapie' }
    ];

    // Uploader les images
    for (const img of images) {
      const imagePath = path.join(__dirname, 'public', 'images', img.name);
      
      if (fs.existsSync(imagePath)) {
        const fileContent = fs.readFileSync(imagePath);
        
        // Vérifier si l'image existe déjà
        const { data: existingFile } = await supabase
          .storage
          .from('service-images')
          .list('', {
            search: img.name
          });

        if (existingFile && existingFile.length > 0) {
          // Supprimer l'ancienne version
          await supabase
            .storage
            .from('service-images')
            .remove([img.name]);
        }

        // Uploader la nouvelle image
        const { data, error } = await supabase
          .storage
          .from('service-images')
          .upload(img.name, fileContent, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (error) {
          console.error(`❌ Erreur upload ${img.name}:`, error);
        } else {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/service-images/${img.name}`;
          console.log(`✅ ${img.displayName} uploadée: ${publicUrl}`);
        }
      } else {
        console.log(`⚠️ Image ${img.name} non trouvée dans public/images`);
      }
    }

    console.log('\n📝 URLs publiques des images:');
    images.forEach(img => {
      console.log(`${img.displayName}: ${supabaseUrl}/storage/v1/object/public/service-images/${img.name}`);
    });

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter le setup
setupStorage().catch(console.error);