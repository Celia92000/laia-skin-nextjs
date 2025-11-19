import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import {
  sendWelcomeEmailDay1,
  sendWelcomeEmailDay3,
  sendWelcomeEmailDay7
} from '@/lib/welcome-emails'

/**
 * Cron job pour envoyer les emails de bienvenue séquencés
 *
 * Configuration Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-welcome-emails?secret=VOTRE_CRON_SECRET",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
 *
 * S'exécute tous les jours à 10h00
 */
export async function GET(request: Request) {
  try {
    // Vérifier le token secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
      log.warn('[Welcome Emails Cron] Accès non autorisé')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    log.info('[Welcome Emails Cron] Début de l\'envoi des emails de bienvenue séquencés')

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let emailsSent = 0
    let errors = 0

    // =========================================
    // EMAIL J+1 : Premiers pas
    // =========================================
    const usersDay1 = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        createdAt: {
          gte: new Date(oneDayAgo.getTime() - 60 * 60 * 1000), // -1h
          lte: new Date(oneDayAgo.getTime() + 60 * 60 * 1000)  // +1h
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    for (const user of usersDay1) {
      try {
        await sendWelcomeEmailDay1({
          email: user.email,
          name: user.name
        })
        emailsSent++
        log.info(`[Welcome J+1] Envoyé à ${user.email}`)
      } catch (error) {
        log.error(`[Welcome J+1] Erreur pour ${user.email}:`, error)
        errors++
      }
    }

    // =========================================
    // EMAIL J+3 : Personnalisation du site
    // =========================================
    const usersDay3 = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        createdAt: {
          gte: new Date(threeDaysAgo.getTime() - 60 * 60 * 1000),
          lte: new Date(threeDaysAgo.getTime() + 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    for (const user of usersDay3) {
      try {
        await sendWelcomeEmailDay3({
          email: user.email,
          name: user.name
        })
        emailsSent++
        log.info(`[Welcome J+3] Envoyé à ${user.email}`)
      } catch (error) {
        log.error(`[Welcome J+3] Erreur pour ${user.email}:`, error)
        errors++
      }
    }

    // =========================================
    // EMAIL J+7 : Bilan de la semaine
    // =========================================
    const usersDay7 = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 60 * 60 * 1000),
          lte: new Date(sevenDaysAgo.getTime() + 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    for (const user of usersDay7) {
      try {
        await sendWelcomeEmailDay7({
          email: user.email,
          name: user.name
        })
        emailsSent++
        log.info(`[Welcome J+7] Envoyé à ${user.email}`)
      } catch (error) {
        log.error(`[Welcome J+7] Erreur pour ${user.email}:`, error)
        errors++
      }
    }

    log.info(`[Welcome Emails Cron] Terminé : ${emailsSent} emails envoyés, ${errors} erreurs`)

    return NextResponse.json({
      success: true,
      emailsSent,
      errors,
      breakdown: {
        day1: usersDay1.length,
        day3: usersDay3.length,
        day7: usersDay7.length
      }
    })

  } catch (error) {
    log.error('[Welcome Emails Cron] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
