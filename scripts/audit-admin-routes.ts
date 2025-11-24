import * as fs from 'fs';
import * as path from 'path';

const adminDir = path.join(__dirname, '../src/app/api/admin');

interface RouteAudit {
  file: string;
  hasAuth: boolean;
  authType: 'verifyToken' | 'requireAdmin' | 'verifyAdmin' | 'requireSuperAdmin' | 'none';
  hasOrgIsolation: boolean;
  functions: string[];
  issues: string[];
}

function auditRoute(filePath: string): RouteAudit {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');

  // Détecter les fonctions HTTP
  const functions: string[] = [];
  if (content.includes('export async function GET')) functions.push('GET');
  if (content.includes('export async function POST')) functions.push('POST');
  if (content.includes('export async function PUT')) functions.push('PUT');
  if (content.includes('export async function PATCH')) functions.push('PATCH');
  if (content.includes('export async function DELETE')) functions.push('DELETE');

  // Détecter le type d'auth
  let authType: 'verifyToken' | 'requireAdmin' | 'verifyAdmin' | 'requireSuperAdmin' | 'none' = 'none';
  let hasAuth = false;

  if (content.includes('requireAdmin(') || content.includes('requireSuperAdmin(')) {
    authType = content.includes('requireSuperAdmin(') ? 'requireSuperAdmin' : 'requireAdmin';
    hasAuth = true;
  } else if (content.includes('verifyAdmin(') || content.includes('verifySuperAdmin(')) {
    authType = content.includes('verifySuperAdmin(') ? 'requireSuperAdmin' : 'verifyAdmin';
    hasAuth = true;
  } else if (content.includes('verifyAuth(')) {
    authType = 'verifyToken';
    hasAuth = true;
  } else if (content.includes('verifyToken(')) {
    authType = 'verifyToken';
    hasAuth = true;
  }

  // Vérifier si authentification est présente (même basique)
  if (content.includes("headers.get('authorization')") || content.includes('Authorization')) {
    hasAuth = true;
    if (authType === 'none') authType = 'verifyToken';
  }

  // Vérifier si utilise headers x-user-id (middleware Next.js)
  if (content.includes("x-user-id") || content.includes("x-organization-id")) {
    hasAuth = true;
    if (authType === 'none') authType = 'verifyToken';
  }

  // Vérifier l'isolation par organizationId
  const hasOrgIsolation =
    content.includes('organizationId:') ||
    content.includes('organizationId =') ||
    content.includes('where: { organizationId') ||
    content.includes("user?.organizationId") ||
    content.includes("decoded?.organizationId");

  // Identifier les problèmes potentiels
  const issues: string[] = [];

  if (!hasAuth) {
    issues.push('❌ AUCUNE AUTHENTIFICATION');
  }

  if (hasAuth && !hasOrgIsolation && !relativePath.includes('onboarding')) {
    issues.push('⚠️ Pas d\'isolation organizationId (risque accès données autres clients)');
  }

  if (content.includes('// TODO') || content.includes('// FIXME')) {
    issues.push('📝 Contient TODO/FIXME');
  }

  // Détecter si utilise verifyToken sans vérifier le rôle
  if (authType === 'verifyToken' && !content.includes('.role')) {
    issues.push('⚠️ Utilise verifyToken mais ne vérifie pas le rôle');
  }

  return {
    file: relativePath,
    hasAuth,
    authType,
    hasOrgIsolation,
    functions,
    issues
  };
}

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) {
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'route.ts') {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

async function main() {
  console.log('🔍 AUDIT DES ROUTES /api/admin/*\n');

  const routeFiles = findRouteFiles(adminDir);
  const audits = routeFiles.map(auditRoute);

  const withAuth = audits.filter(a => a.hasAuth);
  const withoutAuth = audits.filter(a => !a.hasAuth);
  const withoutOrgIsolation = audits.filter(a => a.hasAuth && !a.hasOrgIsolation && !a.file.includes('onboarding'));
  const withIssues = audits.filter(a => a.issues.length > 0);

  console.log(`📊 RÉSULTATS:`);
  console.log(`   Total routes: ${audits.length}`);
  console.log(`   ✅ Avec auth: ${withAuth.length}`);
  console.log(`   ❌ SANS auth: ${withoutAuth.length}`);
  console.log(`   ⚠️  Sans isolation organizationId: ${withoutOrgIsolation.length}`);
  console.log(`   🔴 Avec problèmes: ${withIssues.length}\n`);

  if (withoutAuth.length > 0) {
    console.log('🚨 ROUTES SANS AUTHENTIFICATION (CRITIQUE):');
    withoutAuth.forEach(route => {
      console.log(`   ❌ ${route.file}`);
      console.log(`      Fonctions: ${route.functions.join(', ')}`);
      console.log(`      Problèmes: ${route.issues.join(', ')}\n`);
    });
  }

  if (withoutOrgIsolation.length > 0) {
    console.log('\n⚠️  ROUTES SANS ISOLATION ORGANIZATIONID:');
    withoutOrgIsolation.forEach(route => {
      console.log(`   ⚠️  ${route.file}`);
      console.log(`      Type auth: ${route.authType}`);
      console.log(`      Fonctions: ${route.functions.join(', ')}\n`);
    });
  }

  console.log('\n📋 TOUTES LES ROUTES AVEC PROBLÈMES:');
  withIssues.forEach(route => {
    console.log(`   ${route.file}`);
    console.log(`      Auth: ${route.authType} | OrgIsolation: ${route.hasOrgIsolation ? '✅' : '❌'}`);
    console.log(`      Problèmes: ${route.issues.join(', ')}\n`);
  });

  console.log('\n✅ ROUTES CORRECTEMENT SÉCURISÉES:');
  const secured = audits.filter(a => a.hasAuth && a.issues.length === 0);
  secured.forEach(route => {
    console.log(`   ✅ ${route.file}`);
    console.log(`      Type: ${route.authType} | OrgIsolation: ${route.hasOrgIsolation ? '✅' : '❌'}`);
    console.log(`      Fonctions: ${route.functions.join(', ')}\n`);
  });

  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    total: audits.length,
    withAuth: withAuth.length,
    withoutAuth: withoutAuth.length,
    withoutOrgIsolation: withoutOrgIsolation.length,
    withIssues: withIssues.length,
    routes: audits
  };

  fs.writeFileSync(
    path.join(__dirname, '../AUDIT-ADMIN-ROUTES.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 Rapport sauvegardé dans AUDIT-ADMIN-ROUTES.json');

  if (withoutAuth.length > 0) {
    console.log(`\n⚠️  ${withoutAuth.length} routes SANS authentification trouvées !`);
    process.exit(1);
  } else if (withIssues.length > 0) {
    console.log(`\n⚠️  ${withIssues.length} routes avec problèmes de sécurité trouvées !`);
    process.exit(1);
  } else {
    console.log('\n✅ Toutes les routes admin sont sécurisées !');
    process.exit(0);
  }
}

main();
