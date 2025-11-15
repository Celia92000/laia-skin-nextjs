import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { EmailSyncService } from '@/lib/email-sync';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const config = await getSiteConfig();
  const email = config.email || 'contact@institut.fr';
  const phone = config.phone || '06 XX XX XX XX';
  const website = config.customDomain || 'https://votre-institut.fr';


  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { days = 30 } = body; // Par défaut, synchroniser les 30 derniers jours

    // Récupérer les identifiants depuis les headers ou l'environnement
    const emailUser = request.headers.get('X-Email-User') || process.env.EMAIL_USER || '${email}';
    const emailPassword = request.headers.get('X-Email-Password') || process.env.EMAIL_PASSWORD;
    
    if (!emailPassword) {
      return NextResponse.json({ 
        error: 'Configuration manquante',
        message: 'Le mot de passe email n\'est pas configuré. Utilisez l\'interface de configuration.'
      }, { status: 400 });
    }

    // Lancer la synchronisation avec les identifiants
    const syncService = new EmailSyncService({
      user: emailUser,
      password: emailPassword,
      host: 'mail.gandi.net',
      port: 993,
      tls: true
    });
    
    try {
      await syncService.connect();
      await syncService.syncEmails(days);
      syncService.disconnect();
      
      // Compter les emails synchronisés
      const emailCount = await prisma.emailHistory.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        message: `Synchronisation terminée`,
        emailCount,
        syncedDays: days
      });
      
    } catch (syncError: any) {
      log.error('Erreur de synchronisation:', syncError);
      
      if (syncError.message?.includes('AUTHENTICATIONFAILED')) {
        return NextResponse.json({
          error: 'Authentification échouée',
          message: 'Vérifiez vos identifiants email (EMAIL_USER et EMAIL_PASSWORD)',
          details: syncError.message
        }, { status: 401 });
      }
      
      return NextResponse.json({
        error: 'Erreur de synchronisation',
        message: syncError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    log.error('Erreur API sync:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message
    }, { status: 500 });
  }
}

// GET pour vérifier le statut
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Statistiques des emails
    const stats = await prisma.emailHistory.findMany({
      select: {
        direction: true,
        status: true
      }
    });

    const total = await prisma.emailHistory.count();
    const lastSync = await prisma.emailHistory.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    return NextResponse.json({
      configured: !!process.env.EMAIL_PASSWORD,
      stats,
      total,
      lastSync: lastSync?.createdAt
    });

  } catch (error) {
    log.error('Erreur status sync:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}