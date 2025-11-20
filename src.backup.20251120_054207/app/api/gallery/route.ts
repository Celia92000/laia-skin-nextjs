import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Récupérer l'organisation par domaine personnalisé ou subdomain
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const cleanHost = host.split(':')[0].toLowerCase();

    let organization = null;

    // Sur localhost, on force Laia Skin Institut
    if (cleanHost.includes('localhost')) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' }
      });
    } else {
      // Recherche par domaine, subdomain et fallback
      const parts = cleanHost.split('.');
      const subdomain = parts.length > 1 && parts[0] !== 'www'
        ? parts[0]
        : 'laia-skin-institut';

      const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
        prisma.organization.findUnique({
          where: { domain: cleanHost }
        }),
        prisma.organization.findUnique({
          where: { subdomain: subdomain }
        }),
        prisma.organization.findFirst({
          where: { slug: 'laia-skin-institut' }
        })
      ]);

      organization = orgByDomain || orgBySubdomain || orgBySlug;
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer les images depuis différentes sources
    const photos: any[] = [];

    // 1. Photos de galerie configurées (priorité)
    const galleryPhotos = await prisma.galleryPhoto.findMany({
      where: {
        organizationId: organization.id,
        active: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    galleryPhotos.forEach(photo => {
      photos.push({
        id: photo.id,
        url: photo.url,
        title: photo.title || '',
        type: 'gallery',
        link: photo.linkTo || undefined
      });
    });

    // 2. Photos des services avec galeries (si besoin de plus)
    const services = await prisma.service.findMany({
      where: {
        organizationId: organization.id,
        active: true,
        gallery: { not: null }
      },
      select: {
        id: true,
        name: true,
        gallery: true,
        slug: true
      }
    });

    for (const service of services) {
      if (service.gallery) {
        try {
          const galleryImages = JSON.parse(service.gallery);
          galleryImages.forEach((imageUrl: string) => {
            photos.push({
              id: `service-${service.id}-${imageUrl}`,
              url: imageUrl,
              title: service.name,
              type: 'service',
              link: `/services/${service.slug}`
            });
          });
        } catch (e) {
          // Si le parsing échoue, ignorer
        }
      }
    }

    // 2. Image principale des services (si pas de galerie)
    if (photos.length < 8) {
      const servicesWithImage = await prisma.service.findMany({
        where: {
          organizationId: organization.id,
          active: true,
          mainImage: { not: null }
        },
        select: {
          id: true,
          name: true,
          mainImage: true,
          slug: true
        },
        take: 8 - photos.length
      });

      servicesWithImage.forEach(service => {
        if (service.mainImage) {
          photos.push({
            id: `service-image-${service.id}`,
            url: service.mainImage,
            title: service.name,
            type: 'service',
            link: `/services/${service.slug}`
          });
        }
      });
    }

    // 3. Photos des produits (si besoin)
    if (photos.length < 8) {
      const products = await prisma.product.findMany({
        where: {
          organizationId: organization.id,
          active: true,
          gallery: { not: null }
        },
        select: {
          id: true,
          name: true,
          gallery: true,
          slug: true
        },
        take: 2
      });

      for (const product of products) {
        if (product.gallery && photos.length < 8) {
          try {
            const galleryImages = JSON.parse(product.gallery);
            galleryImages.slice(0, 2).forEach((imageUrl: string) => {
              photos.push({
                id: `product-${product.id}-${imageUrl}`,
                url: imageUrl,
                title: product.name,
                type: 'product',
                link: `/produits/${product.slug}`
              });
            });
          } catch (e) {
            // Si le parsing échoue, ignorer
          }
        }
      }
    }

    // 4. Images des produits (si besoin)
    if (photos.length < 8) {
      const productsWithImage = await prisma.product.findMany({
        where: {
          organizationId: organization.id,
          active: true,
          mainImage: { not: null }
        },
        select: {
          id: true,
          name: true,
          mainImage: true,
          slug: true
        },
        take: 8 - photos.length
      });

      productsWithImage.forEach(product => {
        if (product.mainImage) {
          photos.push({
            id: `product-image-${product.id}`,
            url: product.mainImage,
            title: product.name,
            type: 'product',
            link: `/produits/${product.slug}`
          });
        }
      });
    }

    return NextResponse.json({
      photos: photos.slice(0, 12), // Limiter à 12 photos max
      total: photos.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
