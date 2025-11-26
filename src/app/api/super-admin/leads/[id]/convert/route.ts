import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { log } from '@/lib/logger';
import { sendLeadConvertedWelcome } from '@/lib/email-service';

/**
 * Convertir un lead en organisation cliente (Trial)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer le lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }

    if (lead.status === 'WON' && lead.organizationId) {
      return NextResponse.json({ error: 'Lead déjà converti' }, { status: 400 })
    }

    const data = await request.json()
    const { plan = 'SOLO', sendWelcomeEmail = true } = data

    // Générer slug unique
    const baseSlug = lead.institutName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Générer subdomain unique
    let subdomain = slug
    counter = 1
    while (await prisma.organization.findUnique({ where: { subdomain } })) {
      subdomain = `${slug}-${counter}`
      counter++
    }

    // Mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Créer l'organisation en TRIAL
    const trialDays = 14
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + trialDays)

    const organization = await prisma.organization.create({
      data: {
        name: lead.institutName,
        slug,
        subdomain,
        legalName: lead.institutName,
        type: lead.numberOfLocations > 1 ? 'MULTI_LOCATION' : 'SINGLE_LOCATION',
        plan: plan,
        status: 'TRIAL',
        trialEndsAt: trialEndDate,
        ownerEmail: lead.contactEmail,
        ownerPhone: lead.contactPhone || '',
        billingEmail: lead.contactEmail,
        maxLocations: plan === 'SOLO' ? 1 : plan === 'DUO' ? 2 : plan === 'TEAM' ? 5 : -1,
        maxUsers: plan === 'SOLO' ? 2 : plan === 'DUO' ? 5 : plan === 'TEAM' ? 15 : -1,
        maxStorage: plan === 'SOLO' ? 1 : plan === 'DUO' ? 5 : plan === 'TEAM' ? 20 : 100
      }
    })

    // Créer la configuration par défaut
    await prisma.organizationConfig.create({
      data: {
        organizationId: organization.id,
        siteName: lead.institutName,
        phone: lead.contactPhone || '',
        email: lead.contactEmail,
        address: lead.address,
        city: lead.city,
        postalCode: lead.postalCode
      }
    })

    // Créer l'utilisateur propriétaire
    const owner = await prisma.user.create({
      data: {
        email: lead.contactEmail,
        name: lead.contactName,
        password: hashedPassword,
        role: 'ORG_ADMIN',
        organizationId: organization.id,
        isActive: true
      }
    })

    // Mettre à jour le lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'WON',
        organizationId: organization.id,
        convertedAt: new Date(),
        probability: 100
      }
    })

    // Envoyer email de bienvenue avec credentials
    if (sendWelcomeEmail) {
      await sendLeadConvertedWelcome({
        email: lead.contactEmail,
        contactName: lead.contactName,
        institutName: lead.institutName,
        tempPassword: tempPassword,
        subdomain: subdomain,
        trialDays: trialDays
      });
    }

    return NextResponse.json({
      success: true,
      organization,
      credentials: {
        email: lead.contactEmail,
        temporaryPassword: tempPassword,
        loginUrl: `https://${subdomain}.laiaskin.com/login`
      }
    }, { status: 201 })

  } catch (error) {
    log.error('Erreur conversion lead:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
