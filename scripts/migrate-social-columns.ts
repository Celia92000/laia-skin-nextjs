import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration...');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "OrganizationConfig"
      ADD COLUMN IF NOT EXISTS "showQRCodesSection" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "qrCodesSectionTitle" TEXT,
      ADD COLUMN IF NOT EXISTS "qrCodesSectionDescription" TEXT,
      ADD COLUMN IF NOT EXISTS "showGallerySection" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "gallerySectionTitle" TEXT,
      ADD COLUMN IF NOT EXISTS "gallerySectionDescription" TEXT,
      ADD COLUMN IF NOT EXISTS "galleryImages" TEXT;
  `);

  console.log('Migration completed successfully!');
  console.log('New columns added to OrganizationConfig table:');
  console.log('- showQRCodesSection (BOOLEAN, default: true)');
  console.log('- qrCodesSectionTitle (TEXT)');
  console.log('- qrCodesSectionDescription (TEXT)');
  console.log('- showGallerySection (BOOLEAN, default: false)');
  console.log('- gallerySectionTitle (TEXT)');
  console.log('- gallerySectionDescription (TEXT)');
  console.log('- galleryImages (TEXT)');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
