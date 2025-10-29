import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrganizationById } from '@/lib/tenant-service'
import { prisma } from '@/lib/prisma'
import { serializeOrganizationAddons, getAddonById, parseOrganizationAddons, calculateRecurringAddons } from '@/lib/addons'
import type { OrganizationAddons, AddonPurchaseHistory } from '@/lib/addons'
import { getPlanPrice } from '@/lib/features-simple'
import {
  generateInvoiceNumber,
  generateInvoiceMetadata,
  calculateInvoiceTotal,
  getCurrentBillingPeriod,
  getNextBillingDate
} from '@/lib/subscription-billing'
import { sendInvoiceEmail } from '@/lib/email-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'organisation avec toutes ses données
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        config: true,
        locations: {
          where: { active: true },
          orderBy: { isMainLocation: 'desc' }
        },
        paymentSettings: true,
        loyaltyProgram: true,
        bookingSettings: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer tous les utilisateurs avec leurs rôles
    const users = await prisma.user.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            reservations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Séparer les clients des membres de l'équipe (staff)
    const clients = users.filter(u => u.role === 'CLIENT')
    const staffMembers = users.filter(u => u.role !== 'CLIENT')

    // Compter les utilisateurs par rôle
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Mapper les rôles vers des labels français pour l'équipe
    const roleLabels: Record<string, string> = {
      'ORG_OWNER': 'Propriétaire',
      'ORG_ADMIN': 'Administrateur',
      'LOCATION_MANAGER': 'Responsable d\'établissement',
      'STAFF': 'Praticien(ne)',
      'EMPLOYEE': 'Employé(e)',
      'RECEPTIONIST': 'Réceptionniste',
      'ACCOUNTANT': 'Comptable',
      'SUPER_ADMIN': 'Super Admin LAIA'
    }

    // Statistiques d'activité et factures
    const [
      totalOrgReservations,
      totalOrgServices,
      activeOrgServices,
      totalOrgProducts,
      invoices
    ] = await Promise.all([
      prisma.reservation.count({
        where: { user: { organizationId: organization.id } }
      }),
      prisma.service.count({
        where: { organizationId: organization.id }
      }),
      prisma.service.count({
        where: { organizationId: organization.id, active: true }
      }),
      prisma.product.count({
        where: { organizationId: organization.id }
      }),
      prisma.invoice.findMany({
        where: { organizationId: organization.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculer le monthlyAmount s'il n'existe pas
    let monthlyAmount = organization.monthlyAmount
    if (!monthlyAmount) {
      const basePlanPrice = getPlanPrice(organization.plan as any)
      const recurringAddons = organization.addons ? parseOrganizationAddons(organization.addons).recurring : []
      const recurringAddonsTotal = calculateRecurringAddons(recurringAddons)
      monthlyAmount = basePlanPrice + recurringAddonsTotal
    }

    const enrichedOrganization = {
      ...organization,
      monthlyAmount, // Utiliser le monthlyAmount calculé ou existant
      userStats: {
        total: users.length,
        byRole: usersByRole,
        totalClients: clients.length,
        totalStaff: staffMembers.length
      },
      // 👥 ÉQUIPE DE L'INSTITUT (Staff accounts)
      staffAccounts: staffMembers.map(staff => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        roleLabel: roleLabels[staff.role] || staff.role,
        createdAt: staff.createdAt,
        lastLoginAt: staff.lastLoginAt
      })),
      // 👤 TOP CLIENTS
      topClients: clients
        .sort((a, b) => b._count.reservations - a._count.reservations)
        .slice(0, 5)
        .map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          reservationCount: client._count.reservations,
          createdAt: client.createdAt,
          lastLoginAt: client.lastLoginAt
        })),
      activityStats: {
        reservations: totalOrgReservations,
        services: totalOrgServices,
        activeServices: activeOrgServices,
        products: totalOrgProducts
      },
      invoices: invoices
    }

    return NextResponse.json({
      organization: enrichedOrganization
    })

  } catch (error: any) {
    console.error('❌ Erreur récupération organisation:', error)
    console.error('❌ Stack:', error.stack)
    console.error('❌ Message:', error.message)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const data = await request.json()

    // Vérifier que l'organisation existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id: id }
    })

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Si on change le slug ou subdomain, vérifier qu'ils sont uniques
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findFirst({
        where: { slug: data.slug, id: { not: id } }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
      }
    }

    if (data.subdomain && data.subdomain !== existingOrg.subdomain) {
      const subdomainExists = await prisma.organization.findFirst({
        where: { subdomain: data.subdomain, id: { not: id } }
      })
      if (subdomainExists) {
        return NextResponse.json({ error: 'Ce subdomain existe déjà' }, { status: 400 })
      }
    }

    // Calculer les nouvelles limites si le plan change
    let updateData: any = {
      name: data.name,
      slug: data.slug,
      legalName: data.legalName || null,
      type: data.type,
      subdomain: data.subdomain,
      domain: data.domain || null,
      plan: data.plan,
      status: data.status,

      // Contact propriétaire
      ownerFirstName: data.ownerFirstName || null,
      ownerLastName: data.ownerLastName || null,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone || null,

      // Informations légales et facturation
      siret: data.siret || null,
      tvaNumber: data.tvaNumber || null,
      billingEmail: data.billingEmail || null,
      billingAddress: data.billingAddress || null,
      billingPostalCode: data.billingPostalCode || null,
      billingCity: data.billingCity || null,
      billingCountry: data.billingCountry || null,

      // SEPA
      sepaMandate: data.sepaMandate !== undefined ? data.sepaMandate : undefined,
      sepaIban: data.sepaIban || null,
      sepaBic: data.sepaBic || null,
      sepaAccountHolder: data.sepaAccountHolder || null,
      sepaMandateReference: data.sepaMandateReference || null,
      sepaMandateDate: data.sepaMandateDate ? new Date(data.sepaMandateDate) : null
    }

    if (data.trialEndsAt) {
      updateData.trialEndsAt = new Date(data.trialEndsAt)
    }

    // Si le plan change, mettre à jour les limites
    if (data.plan && data.plan !== existingOrg.plan) {
      const planLimits = {
        SOLO: { maxLocations: 1, maxUsers: 1, maxStorage: 5 },
        DUO: { maxLocations: 1, maxUsers: 3, maxStorage: 10 },
        TEAM: { maxLocations: 3, maxUsers: 10, maxStorage: 50 },
        PREMIUM: { maxLocations: 999, maxUsers: 999, maxStorage: 999 }
      }
      const limits = planLimits[data.plan as keyof typeof planLimits]
      if (limits) {
        updateData = { ...updateData, ...limits }
      }
    }

    // Gérer les add-ons si fournis
    if (data.selectedAddons !== undefined) {
      // Parser les add-ons existants
      let existingAddons: OrganizationAddons = {
        recurring: [],
        oneTime: [],
        history: []
      }

      if (existingOrg.addons) {
        try {
          existingAddons = JSON.parse(existingOrg.addons)
        } catch (e) {
          console.error('Error parsing existing addons:', e)
        }
      }

      // Traiter les nouveaux add-ons
      const selectedAddons: string[] = data.selectedAddons || []
      const newRecurring: string[] = []
      const newOneTime: string[] = []
      const history: AddonPurchaseHistory[] = existingAddons.history || []

      // Séparer par type
      for (const addonId of selectedAddons) {
        const addon = getAddonById(addonId)
        if (addon) {
          if (addon.type === 'recurring') {
            newRecurring.push(addonId)
          } else {
            newOneTime.push(addonId)
          }

          // Ajouter à l'historique si nouveau
          const alreadyInHistory = history.some(h => h.addonId === addonId)
          if (!alreadyInHistory) {
            history.push({
              addonId: addon.id,
              purchaseDate: new Date().toISOString(),
              price: addon.price,
              type: addon.type,
              status: addon.type === 'recurring' ? 'active' : 'completed',
            })
          }
        }
      }

      // Créer le nouvel objet addons
      const organizationAddons: OrganizationAddons = {
        recurring: newRecurring,
        oneTime: newOneTime,
        history: history,
      }

      updateData.addons = serializeOrganizationAddons(organizationAddons)

      // Recalculer le montant mensuel si les add-ons changent
      const finalPlan = data.plan || existingOrg.plan
      const basePlanPrice = getPlanPrice(finalPlan as any)
      const recurringAddonsTotal = calculateRecurringAddons(newRecurring)
      updateData.monthlyAmount = basePlanPrice + recurringAddonsTotal
    }

    // Si le plan change, recalculer le montant mensuel
    if (data.plan && data.plan !== existingOrg.plan) {
      const basePlanPrice = getPlanPrice(data.plan as any)
      const existingRecurring = existingOrg.addons ? parseOrganizationAddons(existingOrg.addons).recurring : []
      const recurringAddonsTotal = calculateRecurringAddons(existingRecurring)
      updateData.monthlyAmount = basePlanPrice + recurringAddonsTotal
    }

    // Déterminer si on doit générer une facture
    const planChanged = data.plan && data.plan !== existingOrg.plan
    const addonsChanged = data.selectedAddons !== undefined &&
      JSON.stringify(data.selectedAddons) !== JSON.stringify(
        existingOrg.addons ? parseOrganizationAddons(existingOrg.addons).recurring : []
      )

    let invoice = null

    // Si changement de forfait ou d'add-ons, générer une facture
    if (planChanged || addonsChanged) {
      const billingPeriod = getCurrentBillingPeriod()
      const dueDate = getNextBillingDate()

      // Déterminer le type de changement
      let changeType: 'upgrade' | 'downgrade' | 'addon_added' | 'addon_removed' | undefined

      if (planChanged) {
        const planOrder = { SOLO: 1, DUO: 2, TEAM: 3, PREMIUM: 4 }
        const oldPlanValue = planOrder[existingOrg.plan as keyof typeof planOrder] || 0
        const newPlanValue = planOrder[data.plan as keyof typeof planOrder] || 0
        changeType = newPlanValue > oldPlanValue ? 'upgrade' : 'downgrade'
      } else if (addonsChanged) {
        const oldAddons = existingOrg.addons ? parseOrganizationAddons(existingOrg.addons).recurring : []
        const newAddons = data.selectedAddons || []
        changeType = newAddons.length > oldAddons.length ? 'addon_added' : 'addon_removed'
      }

      // Générer les métadonnées de la facture avec prorata
      const metadata = generateInvoiceMetadata(
        data.plan || existingOrg.plan,
        updateData.addons || existingOrg.addons,
        billingPeriod.start,
        billingPeriod.end,
        changeType,
        existingOrg.plan,
        existingOrg.addons
      )

      // Calculer le montant total (inclut le prorata)
      const totalLineItems = metadata.lineItems.reduce((sum, item) => sum + item.total, 0)

      // Générer le numéro de facture
      const invoiceNumber = generateInvoiceNumber()

      // Créer la facture
      invoice = await prisma.invoice.create({
        data: {
          organizationId: id,
          invoiceNumber,
          amount: totalLineItems,
          plan: data.plan || existingOrg.plan,
          status: 'PENDING',
          issueDate: new Date(),
          dueDate,
          description: changeType
            ? `${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Modification'} - ${existingOrg.plan} → ${data.plan || existingOrg.plan}`
            : `Facturation ${data.plan || existingOrg.plan}`,
          metadata: metadata as any
        }
      })

      // Envoyer la facture par email automatiquement
      try {
        await sendInvoiceEmail({
          organizationName: existingOrg.name,
          ownerEmail: existingOrg.ownerEmail,
          invoiceNumber,
          amount: totalLineItems,
          dueDate,
          plan: data.plan || existingOrg.plan,
          lineItems: metadata.lineItems,
          changeType,
          prorata: metadata.prorata
        })
        console.log(`✅ Facture ${invoiceNumber} envoyée par email à ${existingOrg.ownerEmail}`)
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email facture:', emailError)
        // On ne bloque pas la création de la facture si l'envoi email échoue
      }
    }

    // Mettre à jour l'organisation
    const organization = await prisma.organization.update({
      where: { id: id },
      data: updateData
    })

    return NextResponse.json({
      organization,
      invoice // Retourner la facture générée si créée
    })

  } catch (error) {
    console.error('Erreur mise à jour organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: id },
      include: {
        users: true,
        locations: true,
        services: true,
        products: true,
        reservations: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Empêcher la suppression de l'organisation par défaut (Laia Skin)
    if (organization.slug === 'laia-skin') {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'organisation par défaut (Laia Skin)' },
        { status: 400 }
      )
    }

    // Supprimer toutes les données liées (en cascade)
    // L'ordre est important pour respecter les contraintes de clés étrangères

    console.log(`🗑️ Suppression de l'organisation ${organization.name}...`)

    // 1. Supprimer les réservations
    await prisma.reservation.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.reservations.length} réservations supprimées`)

    // 2. Supprimer les services et produits
    await prisma.service.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.services.length} services supprimés`)

    await prisma.product.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.products.length} produits supprimés`)

    // 3. Supprimer les formations
    await prisma.formation.deleteMany({
      where: { organizationId: id }
    })

    // 4. Supprimer les articles de blog
    await prisma.blogArticle.deleteMany({
      where: { organizationId: id }
    })

    // 5. Supprimer les utilisateurs
    await prisma.user.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.users.length} utilisateurs supprimés`)

    // 6. Supprimer les emplacements
    await prisma.location.deleteMany({
      where: { organizationId: id }
    })
    console.log(`  ✓ ${organization.locations.length} emplacements supprimés`)

    // 7. Supprimer les paramètres
    await prisma.organizationConfig.deleteMany({
      where: { organizationId: id }
    })

    await prisma.paymentSettings.deleteMany({
      where: { organizationId: id }
    })

    await prisma.bookingSettings.deleteMany({
      where: { organizationId: id }
    })

    await prisma.loyaltyProgramSettings.deleteMany({
      where: { organizationId: id }
    })

    // 8. Supprimer l'organisation elle-même
    await prisma.organization.delete({
      where: { id: id }
    })

    console.log(`✅ Organisation ${organization.name} supprimée avec succès`)

    return NextResponse.json({
      message: 'Organisation supprimée avec succès',
      deleted: {
        organization: organization.name,
        users: organization.users.length,
        locations: organization.locations.length,
        services: organization.services.length,
        products: organization.products.length,
        reservations: organization.reservations.length
      }
    })

  } catch (error) {
    console.error('Erreur suppression organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    )
  }
}
