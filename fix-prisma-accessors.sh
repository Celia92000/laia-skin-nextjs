#!/bin/bash

echo "Fixing incorrect Prisma model accessor patterns..."

# Fix prisma.User?. → prisma.user.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.User?\./prisma.user./g' {} +

# Fix prisma.Organization?. → prisma.organization.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Organization?\./prisma.organization./g' {} +

# Fix prisma.Service?. → prisma.service.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Service?\./prisma.service./g' {} +

# Fix prisma.Product?. → prisma.product.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Product?\./prisma.product./g' {} +

# Fix prisma.Reservation?. → prisma.reservation.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Reservation?\./prisma.reservation./g' {} +

# Fix prisma.Review?. → prisma.review.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Review?\./prisma.review./g' {} +

# Fix prisma.GalleryPhoto?. → prisma.galleryPhoto.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.GalleryPhoto?\./prisma.galleryPhoto./g' {} +

# Fix prisma.Addon?. → prisma.addon.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.Addon?\./prisma.addon./g' {} +

# Fix prisma.GiftCard?. → prisma.giftCard.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.GiftCard?\./prisma.giftCard./g' {} +

echo "Prisma model accessor patterns fixed!"
