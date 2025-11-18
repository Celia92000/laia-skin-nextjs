import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * POST /api/super-admin/sync-template
 * Synchronise INTELLIGEMMENT le template (LAIA Skin Institut) vers toutes les organisations
 *
 * RÈGLES DE SYNCHRONISATION :
 * - SI élément isCustomized = true → NE JAMAIS TOUCHER (préservé)
 * - SI élément isCustomized = false → METTRE À JOUR depuis template
 * - SI élément n'existe pas → CRÉER depuis template
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification super-admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Identifier l'organisation template (LAIA Skin Institut)
    const templateOrg = await prisma.organization.findFirst({
      where: {
        slug: 'laia-skin-institut'
      },
      include: {
        services: true,
        products: true,
        blogPosts: true,
        config: true
      }
    })

    if (!templateOrg) {
      return NextResponse.json(
        { error: 'Organisation template "laia-skin-institut" introuvable' },
        { status: 404 }
      )
    }

    // Récupérer TOUTES les formations (pas dans Organization)
    const templateFormations = await prisma.formation.findMany({
      where: { organizationId: templateOrg.id }
    })

    // Récupérer toutes les autres organisations actives
    const organizations = await prisma.organization.findMany({
      where: {
        id: { not: templateOrg.id },
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    })

    let syncedCount = 0
    const syncReport = {
      services: { created: 0, updated: 0, skipped: 0 },
      products: { created: 0, updated: 0, skipped: 0 },
      blogPosts: { created: 0, updated: 0, skipped: 0 },
      formations: { created: 0, updated: 0, skipped: 0 },
      config: { updated: 0, skipped: 0 }
    }
    const errors: string[] = []

    // Synchroniser chaque organisation
    for (const org of organizations) {
      try {
        await (prisma as any).$transaction(async (tx: any) => {
          // ========================================
          // 1. SYNCHRONISER LES SERVICES
          // ========================================
          for (const templateService of templateOrg.services) {
            // Chercher si ce service existe déjà (via templateSourceId)
            const existingService = await tx.service.findFirst({
              where: {
                organizationId: org.id,
                templateSourceId: templateService.id
              }
            })

            if (existingService) {
              // Service existe : vérifier s'il est personnalisé
              if (existingService.isCustomized) {
                // PERSONNALISÉ → Ne pas toucher
                syncReport.services.skipped++
              } else {
                // PAS PERSONNALISÉ → Mettre à jour depuis template
                await tx.service.update({
                  where: { id: existingService.id },
                  data: {
                    name: templateService.name,
                    slug: templateService.slug,
                    description: templateService.description,
                    shortDescription: templateService.shortDescription,
                    price: templateService.price,
                    launchPrice: templateService.launchPrice,
                    promoPrice: templateService.promoPrice,
                    forfaitPrice: templateService.forfaitPrice,
                    forfaitPromo: templateService.forfaitPromo,
                    duration: templateService.duration,
                    benefits: templateService.benefits,
                    protocol: templateService.protocol,
                    recommendations: templateService.recommendations,
                    contraindications: templateService.contraindications,
                    mainImage: templateService.mainImage,
                    imageSettings: templateService.imageSettings,
                    imagePositionX: templateService.imagePositionX,
                    imagePositionY: templateService.imagePositionY,
                    imageObjectFit: templateService.imageObjectFit,
                    gallery: templateService.gallery,
                    videoUrl: templateService.videoUrl,
                    categoryId: templateService.categoryId,
                    subcategoryId: templateService.subcategoryId,
                    order: templateService.order,
                    active: templateService.active,
                    featured: templateService.featured,
                    metaTitle: templateService.metaTitle,
                    metaDescription: templateService.metaDescription,
                    keywords: templateService.keywords
                  }
                })
                syncReport.services.updated++
              }
            } else {
              // Service n'existe pas → Créer depuis template
              await tx.service.create({
                data: {
                  organizationId: org.id,
                  templateSourceId: templateService.id,
                  isCustomized: false,
                  slug: templateService.slug,
                  name: templateService.name,
                  description: templateService.description,
                  shortDescription: templateService.shortDescription,
                  price: templateService.price,
                  launchPrice: templateService.launchPrice,
                  promoPrice: templateService.promoPrice,
                  forfaitPrice: templateService.forfaitPrice,
                  forfaitPromo: templateService.forfaitPromo,
                  duration: templateService.duration,
                  benefits: templateService.benefits,
                  protocol: templateService.protocol,
                  recommendations: templateService.recommendations,
                  contraindications: templateService.contraindications,
                  mainImage: templateService.mainImage,
                  imageSettings: templateService.imageSettings,
                  imagePositionX: templateService.imagePositionX,
                  imagePositionY: templateService.imagePositionY,
                  imageObjectFit: templateService.imageObjectFit,
                  gallery: templateService.gallery,
                  videoUrl: templateService.videoUrl,
                  categoryId: templateService.categoryId,
                  subcategoryId: templateService.subcategoryId,
                  order: templateService.order,
                  active: templateService.active,
                  featured: templateService.featured,
                  metaTitle: templateService.metaTitle,
                  metaDescription: templateService.metaDescription,
                  keywords: templateService.keywords
                }
              })
              syncReport.services.created++
            }
          }

          // ========================================
          // 2. SYNCHRONISER LES PRODUITS
          // ========================================
          for (const templateProduct of templateOrg.products) {
            const existingProduct = await tx.product.findFirst({
              where: {
                organizationId: org.id,
                templateSourceId: templateProduct.id
              }
            })

            if (existingProduct) {
              if (existingProduct.isCustomized) {
                syncReport.products.skipped++
              } else {
                await tx.product.update({
                  where: { id: existingProduct.id },
                  data: {
                    name: templateProduct.name,
                    slug: templateProduct.slug,
                    description: templateProduct.description,
                    shortDescription: templateProduct.shortDescription,
                    price: templateProduct.price,
                    salePrice: templateProduct.salePrice,
                    categoryId: templateProduct.categoryId,
                    brand: templateProduct.brand,
                    mainImage: templateProduct.mainImage,
                    imageSettings: templateProduct.imageSettings,
                    gallery: templateProduct.gallery,
                    ingredients: templateProduct.ingredients,
                    usage: templateProduct.usage,
                    benefits: templateProduct.benefits,
                    active: templateProduct.active,
                    featured: templateProduct.featured,
                    order: templateProduct.order,
                    metaTitle: templateProduct.metaTitle,
                    metaDescription: templateProduct.metaDescription,
                    keywords: templateProduct.keywords
                  }
                })
                syncReport.products.updated++
              }
            } else {
              await tx.product.create({
                data: {
                  organizationId: org.id,
                  templateSourceId: templateProduct.id,
                  isCustomized: false,
                  slug: templateProduct.slug,
                  name: templateProduct.name,
                  description: templateProduct.description,
                  shortDescription: templateProduct.shortDescription,
                  price: templateProduct.price,
                  salePrice: templateProduct.salePrice,
                  categoryId: templateProduct.categoryId,
                  brand: templateProduct.brand,
                  mainImage: templateProduct.mainImage,
                  imageSettings: templateProduct.imageSettings,
                  gallery: templateProduct.gallery,
                  ingredients: templateProduct.ingredients,
                  usage: templateProduct.usage,
                  benefits: templateProduct.benefits,
                  active: templateProduct.active,
                  featured: templateProduct.featured,
                  order: templateProduct.order,
                  metaTitle: templateProduct.metaTitle,
                  metaDescription: templateProduct.metaDescription,
                  keywords: templateProduct.keywords
                }
              })
              syncReport.products.created++
            }
          }

          // ========================================
          // 3. SYNCHRONISER LES ARTICLES DE BLOG
          // ========================================
          for (const templatePost of templateOrg.blogPosts) {
            const existingPost = await tx.blogPost.findFirst({
              where: {
                organizationId: org.id,
                templateSourceId: templatePost.id
              }
            })

            if (existingPost) {
              if (existingPost.isCustomized) {
                syncReport.blogPosts.skipped++
              } else {
                await tx.blogPost.update({
                  where: { id: existingPost.id },
                  data: {
                    slug: templatePost.slug,
                    title: templatePost.title,
                    excerpt: templatePost.excerpt,
                    content: templatePost.content,
                    category: templatePost.category,
                    author: templatePost.author,
                    readTime: templatePost.readTime,
                    mainImage: templatePost.mainImage,
                    gallery: templatePost.gallery,
                    tags: templatePost.tags,
                    featured: templatePost.featured,
                    published: templatePost.published,
                    metaTitle: templatePost.metaTitle,
                    metaDescription: templatePost.metaDescription
                  }
                })
                syncReport.blogPosts.updated++
              }
            } else {
              await tx.blogPost.create({
                data: {
                  organizationId: org.id,
                  templateSourceId: templatePost.id,
                  isCustomized: false,
                  slug: templatePost.slug,
                  title: templatePost.title,
                  excerpt: templatePost.excerpt,
                  content: templatePost.content,
                  category: templatePost.category,
                  author: templatePost.author,
                  readTime: templatePost.readTime,
                  mainImage: templatePost.mainImage,
                  gallery: templatePost.gallery,
                  tags: templatePost.tags,
                  featured: templatePost.featured,
                  published: templatePost.published,
                  publishedAt: templatePost.publishedAt,
                  metaTitle: templatePost.metaTitle,
                  metaDescription: templatePost.metaDescription
                }
              })
              syncReport.blogPosts.created++
            }
          }

          // ========================================
          // 4. SYNCHRONISER LES FORMATIONS
          // ========================================
          for (const templateFormation of templateFormations) {
            const existingFormation = await tx.formation.findFirst({
              where: {
                organizationId: org.id,
                templateSourceId: templateFormation.id
              }
            })

            if (existingFormation) {
              if (existingFormation.isCustomized) {
                syncReport.formations.skipped++
              } else {
                await tx.formation.update({
                  where: { id: existingFormation.id },
                  data: {
                    slug: templateFormation.slug,
                    name: templateFormation.name,
                    shortDescription: templateFormation.shortDescription,
                    description: templateFormation.description,
                    price: templateFormation.price,
                    promoPrice: templateFormation.promoPrice,
                    duration: templateFormation.duration,
                    level: templateFormation.level,
                    program: templateFormation.program,
                    objectives: templateFormation.objectives,
                    prerequisites: templateFormation.prerequisites,
                    certification: templateFormation.certification,
                    maxParticipants: templateFormation.maxParticipants,
                    mainImage: templateFormation.mainImage,
                    imageSettings: templateFormation.imageSettings,
                    gallery: templateFormation.gallery,
                    videoUrl: templateFormation.videoUrl,
                    category: templateFormation.category,
                    instructor: templateFormation.instructor,
                    active: templateFormation.active,
                    featured: templateFormation.featured,
                    order: templateFormation.order,
                    metaTitle: templateFormation.metaTitle,
                    metaDescription: templateFormation.metaDescription,
                    keywords: templateFormation.keywords
                  }
                })
                syncReport.formations.updated++
              }
            } else {
              await tx.formation.create({
                data: {
                  organizationId: org.id,
                  templateSourceId: templateFormation.id,
                  isCustomized: false,
                  slug: templateFormation.slug,
                  name: templateFormation.name,
                  shortDescription: templateFormation.shortDescription,
                  description: templateFormation.description,
                  price: templateFormation.price,
                  promoPrice: templateFormation.promoPrice,
                  duration: templateFormation.duration,
                  level: templateFormation.level,
                  program: templateFormation.program,
                  objectives: templateFormation.objectives,
                  prerequisites: templateFormation.prerequisites,
                  certification: templateFormation.certification,
                  maxParticipants: templateFormation.maxParticipants,
                  mainImage: templateFormation.mainImage,
                  imageSettings: templateFormation.imageSettings,
                  gallery: templateFormation.gallery,
                  videoUrl: templateFormation.videoUrl,
                  category: templateFormation.category,
                  instructor: templateFormation.instructor,
                  active: templateFormation.active,
                  featured: templateFormation.featured,
                  order: templateFormation.order,
                  metaTitle: templateFormation.metaTitle,
                  metaDescription: templateFormation.metaDescription,
                  keywords: templateFormation.keywords
                }
              })
              syncReport.formations.created++
            }
          }

          // ========================================
          // 5. SYNCHRONISER LA CONFIGURATION (PARTIELLEMENT)
          // ========================================
          if (templateOrg.config) {
            const existingConfig = await tx.organizationConfig.findUnique({
              where: { organizationId: org.id }
            })

            if (existingConfig) {
              // Parser customizedFields pour savoir quoi préserver
              let customizedFields: any = {}
              try {
                customizedFields = JSON.parse(existingConfig.customizedFields || '{}')
              } catch (e) {
                customizedFields = {}
              }

              // Construire les données à mettre à jour (seulement champs non personnalisés)
              const updateData: any = {}

              // Liste des champs synchronisables
              const syncableFields = [
                'primaryColor', 'secondaryColor', 'accentColor',
                'fontFamily', 'headingFont', 'baseFontSize', 'headingSize',
                'founderName', 'founderTitle', 'founderQuote', 'founderImage',
                'aboutIntro', 'aboutParcours', 'formations', 'testimonials',
                'termsAndConditions', 'privacyPolicy', 'legalNotice',
                'defaultMetaTitle', 'defaultMetaDescription', 'defaultMetaKeywords'
              ]

              for (const field of syncableFields) {
                if (customizedFields[field] !== 'customized') {
                  // Champ pas personnalisé → synchroniser
                  if ((templateOrg.config as any)[field] !== undefined) {
                    updateData[field] = (templateOrg.config as any)[field]
                  }
                }
              }

              if (Object.keys(updateData).length > 0) {
                await tx.organizationConfig.update({
                  where: { id: existingConfig.id },
                  data: updateData
                })
                syncReport.config.updated++
              } else {
                syncReport.config.skipped++
              }
            } else {
              // Pas de config → créer depuis template
              await tx.organizationConfig.create({
                data: {
                  organizationId: org.id,
                  siteName: org.name,
                  siteTagline: templateOrg.config.siteTagline,
                  primaryColor: templateOrg.config.primaryColor,
                  secondaryColor: templateOrg.config.secondaryColor,
                  accentColor: templateOrg.config.accentColor,
                  fontFamily: templateOrg.config.fontFamily,
                  headingFont: templateOrg.config.headingFont,
                  baseFontSize: templateOrg.config.baseFontSize,
                  headingSize: templateOrg.config.headingSize,
                  founderName: templateOrg.config.founderName,
                  founderTitle: templateOrg.config.founderTitle,
                  founderQuote: templateOrg.config.founderQuote,
                  founderImage: templateOrg.config.founderImage,
                  aboutIntro: templateOrg.config.aboutIntro,
                  aboutParcours: templateOrg.config.aboutParcours,
                  termsAndConditions: templateOrg.config.termsAndConditions,
                  privacyPolicy: templateOrg.config.privacyPolicy,
                  legalNotice: templateOrg.config.legalNotice,
                  customizedFields: '{}'
                }
              })
              syncReport.config.updated++
            }
          }
        })

        syncedCount++
      } catch (error) {
        log.error(`Erreur sync pour ${org.name}:`, error)
        errors.push(`${org.name}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      total: organizations.length,
      template: templateOrg.name,
      report: syncReport,
      errors: errors.length > 0 ? errors : undefined,
      message: `✅ Synchronisation terminée : ${syncedCount}/${organizations.length} organisations mises à jour`
    })

  } catch (error) {
    log.error('Erreur sync template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    )
  }
}
