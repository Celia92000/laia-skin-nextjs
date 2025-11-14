import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Récupérer l'organisation ET sa config (l'onboarding remplit Organization, la config remplit OrganizationConfig)
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        config: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    const config = organization.config
    const org = organization

    // Compter le nombre de services
    const servicesCount = await prisma.service.count({
      where: { organizationId }
    })

    // Calculer le taux de complétion pour chaque section
    // ⚠️ Ne montrer QUE ce qui n'est PAS dans l'onboarding !
    const sections = {
      services: {
        label: 'Services additionnels',
        fields: [
          { name: 'service1', value: servicesCount >= 1 ? 'ok' : null },
          { name: 'service2', value: servicesCount >= 2 ? 'ok' : null },
          { name: 'service3', value: servicesCount >= 3 ? 'ok' : null }
        ]
      },
      appearance: {
        label: 'Couleur accent (facultatif)',
        fields: [
          { name: 'accentColor', value: config?.accentColor }
        ]
      },
      seo: {
        label: 'SEO avancé (facultatif)',
        fields: [
          { name: 'seoTitle', value: config?.seoTitle },
          { name: 'seoDescription', value: config?.seoDescription },
          { name: 'seoKeywords', value: config?.seoKeywords }
        ]
      }
    }

    // Calculer le pourcentage pour chaque section
    const completionData: Record<string, any> = {}
    let totalFields = 0
    let completedFields = 0

    Object.entries(sections).forEach(([key, section]) => {
      const sectionTotal = section.fields.length
      const sectionCompleted = section.fields.filter(field => {
        const value = field.value
        if (value === null || value === undefined || value === '') return false
        if (typeof value === 'string' && value.trim() === '') return false
        if (typeof value === 'object' && Object.keys(value).length === 0) return false
        return true
      }).length

      const percentage = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

      completionData[key] = {
        label: section.label,
        completed: sectionCompleted,
        total: sectionTotal,
        percentage,
        isCompleted: percentage === 100
      }

      totalFields += sectionTotal
      completedFields += sectionCompleted
    })

    // Pourcentage global
    const globalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0

    return NextResponse.json({
      globalPercentage,
      totalFields,
      completedFields,
      sections: completionData
    })

  } catch (error) {
    console.error('Erreur calcul complétion config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
