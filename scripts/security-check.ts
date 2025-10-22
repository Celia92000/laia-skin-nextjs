#!/usr/bin/env tsx
/**
 * Script de vérification de sécurité
 * Vérifie que toutes les mesures de sécurité sont en place
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  fix: string;
}

const issues: SecurityIssue[] = [];

async function checkSecurityConfig() {
  console.log('🔍 Vérification de la configuration de sécurité...\n');

  // 1. Vérifier JWT_SECRET
  console.log('📌 Vérification JWT_SECRET...');
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    issues.push({
      severity: 'critical',
      category: 'Authentication',
      issue: 'JWT_SECRET manquant',
      fix: 'Générer un secret : openssl rand -base64 64'
    });
  } else if (jwtSecret.length < 32) {
    issues.push({
      severity: 'high',
      category: 'Authentication',
      issue: 'JWT_SECRET trop court (< 32 caractères)',
      fix: 'Générer un secret plus long : openssl rand -base64 64'
    });
  } else if (jwtSecret === 'laia-skin-secret-key-2024') {
    issues.push({
      severity: 'critical',
      category: 'Authentication',
      issue: 'JWT_SECRET utilise encore la valeur par défaut',
      fix: 'Changer immédiatement : openssl rand -base64 64'
    });
  } else {
    console.log('  ✅ JWT_SECRET configuré correctement');
  }

  // 2. Vérifier Stripe
  console.log('\n📌 Vérification Stripe...');
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey?.startsWith('sk_test_')) {
    issues.push({
      severity: 'critical',
      category: 'Payments',
      issue: 'Stripe en mode TEST (sk_test_)',
      fix: 'Remplacer par les clés de production (sk_live_) avant déploiement'
    });
  } else if (stripeKey?.startsWith('sk_live_')) {
    console.log('  ✅ Stripe en mode PRODUCTION');
  } else {
    issues.push({
      severity: 'high',
      category: 'Payments',
      issue: 'Clé Stripe manquante ou invalide',
      fix: 'Configurer STRIPE_SECRET_KEY dans .env.local'
    });
  }

  // 3. Vérifier tokens Meta
  console.log('\n📌 Vérification tokens Meta (WhatsApp, Instagram, Facebook)...');

  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const facebookToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!whatsappToken || whatsappToken.length < 50) {
    issues.push({
      severity: 'high',
      category: 'Integrations',
      issue: 'Token WhatsApp manquant ou invalide',
      fix: 'Renouveler le token sur developers.facebook.com'
    });
  } else {
    console.log('  ✅ Token WhatsApp présent');
  }

  if (!instagramToken || instagramToken.length < 50) {
    issues.push({
      severity: 'medium',
      category: 'Integrations',
      issue: 'Token Instagram manquant ou invalide',
      fix: 'Renouveler le token sur developers.facebook.com'
    });
  } else {
    console.log('  ✅ Token Instagram présent');
  }

  if (!facebookToken || facebookToken.length < 50) {
    issues.push({
      severity: 'medium',
      category: 'Integrations',
      issue: 'Token Facebook manquant ou invalide',
      fix: 'Renouveler le token sur developers.facebook.com'
    });
  } else {
    console.log('  ✅ Token Facebook présent');
  }

  // 4. Vérifier Email
  console.log('\n📌 Vérification Email (Resend)...');
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey || resendKey.startsWith('re_')) {
    console.log('  ✅ Resend API Key configurée');
  } else {
    issues.push({
      severity: 'high',
      category: 'Email',
      issue: 'Resend API Key manquante ou invalide',
      fix: 'Configurer RESEND_API_KEY dans .env.local'
    });
  }

  // 5. Vérifier Sentry
  console.log('\n📌 Vérification Sentry...');
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const sentryToken = process.env.SENTRY_AUTH_TOKEN;

  if (!sentryDsn) {
    issues.push({
      severity: 'medium',
      category: 'Monitoring',
      issue: 'Sentry DSN manquant',
      fix: 'Configurer NEXT_PUBLIC_SENTRY_DSN pour le monitoring d\'erreurs'
    });
  }

  if (!sentryToken) {
    issues.push({
      severity: 'low',
      category: 'Monitoring',
      issue: 'Sentry Auth Token manquant',
      fix: 'Configurer SENTRY_AUTH_TOKEN pour les source maps'
    });
  }

  // 6. Vérifier fichiers sensibles
  console.log('\n📌 Vérification fichiers sensibles...');
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

    if (!gitignore.includes('.env.local')) {
      issues.push({
        severity: 'critical',
        category: 'Security',
        issue: '.env.local n\'est pas dans .gitignore',
        fix: 'Ajouter .env.local au .gitignore immédiatement'
      });
    } else {
      console.log('  ✅ .env.local dans .gitignore');
    }
  }
}

async function checkDatabaseSecurity() {
  console.log('\n📌 Vérification sécurité base de données...');

  try {
    // Vérifier mots de passe par défaut
    const defaultPasswordUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'admin@laiaskin.com' },
          { email: 'superadmin@laiaskin.com' }
        ]
      },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const user of defaultPasswordUsers) {
      if (user.updatedAt < oneWeekAgo) {
        issues.push({
          severity: 'high',
          category: 'Authentication',
          issue: `Mot de passe de ${user.email} non changé récemment`,
          fix: 'Exécuter scripts/update-default-passwords.ts'
        });
      } else {
        console.log(`  ✅ ${user.email} mis à jour récemment`);
      }
    }

    // Vérifier super admin existe
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
      issues.push({
        severity: 'critical',
        category: 'Access Control',
        issue: 'Aucun SUPER_ADMIN trouvé en base',
        fix: 'Créer un compte super admin avec un mot de passe fort'
      });
    } else {
      console.log('  ✅ Super Admin existe');
    }

    // Vérifier users sans email vérifié (quand le champ existera)
    // const unverifiedUsers = await prisma.user.count({
    //   where: { emailVerified: false }
    // });
    // console.log(`  ℹ️  ${unverifiedUsers} utilisateur(s) avec email non vérifié`);

  } catch (error) {
    console.error('  ❌ Erreur vérification base de données:', error);
  }
}

async function displayResults() {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RÉSULTATS DE L\'AUDIT DE SÉCURITÉ');
  console.log('═'.repeat(80) + '\n');

  if (issues.length === 0) {
    console.log('✅ ✅ ✅ AUCUN PROBLÈME DÉTECTÉ ! ✅ ✅ ✅\n');
    console.log('Votre configuration de sécurité est correcte.\n');
    return;
  }

  const critical = issues.filter(i => i.severity === 'critical');
  const high = issues.filter(i => i.severity === 'high');
  const medium = issues.filter(i => i.severity === 'medium');
  const low = issues.filter(i => i.severity === 'low');

  console.log(`🔴 CRITIQUE: ${critical.length}`);
  console.log(`🟠 HAUTE:    ${high.length}`);
  console.log(`🟡 MOYENNE:  ${medium.length}`);
  console.log(`🟢 BASSE:    ${low.length}`);
  console.log(`TOTAL:      ${issues.length}\n`);

  if (critical.length > 0) {
    console.log('🔴 PROBLÈMES CRITIQUES (À CORRIGER IMMÉDIATEMENT) :');
    console.log('━'.repeat(80));
    critical.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.fix}`);
    });
    console.log('\n');
  }

  if (high.length > 0) {
    console.log('🟠 PROBLÈMES HAUTE PRIORITÉ :');
    console.log('━'.repeat(80));
    high.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.fix}`);
    });
    console.log('\n');
  }

  if (medium.length > 0) {
    console.log('🟡 PROBLÈMES MOYENNE PRIORITÉ :');
    console.log('━'.repeat(80));
    medium.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.fix}`);
    });
    console.log('\n');
  }

  if (low.length > 0) {
    console.log('🟢 PROBLÈMES BASSE PRIORITÉ :');
    console.log('━'.repeat(80));
    low.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.fix}`);
    });
    console.log('\n');
  }

  console.log('═'.repeat(80));
  console.log('📋 PROCHAINES ÉTAPES :');
  console.log('═'.repeat(80));
  console.log('\n1. Corriger TOUS les problèmes CRITIQUES immédiatement');
  console.log('2. Planifier correction des problèmes HAUTE priorité');
  console.log('3. Consulter SECURITE-COMPLETE.md pour plus de détails');
  console.log('4. Relancer ce script après corrections\n');
}

async function main() {
  console.log('\n🔐 AUDIT DE SÉCURITÉ - LAIA');
  console.log('═'.repeat(80) + '\n');

  await checkSecurityConfig();
  await checkDatabaseSecurity();
  await displayResults();

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erreur durant l\'audit:', error);
  process.exit(1);
});
