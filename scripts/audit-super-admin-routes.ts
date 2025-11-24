import * as fs from 'fs';
import * as path from 'path';

const superAdminDir = path.join(__dirname, '../src/app/api/super-admin');

interface RouteAudit {
  file: string;
  hasAuth: boolean;
  authType: 'verifyToken' | 'requireSuperAdmin' | 'none';
  functions: string[];
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
  let authType: 'verifyToken' | 'requireSuperAdmin' | 'none' = 'none';
  let hasAuth = false;

  if (content.includes('requireSuperAdmin') || content.includes('verifySuperAdmin')) {
    authType = 'requireSuperAdmin';
    hasAuth = true;
  } else if (content.includes('verifyToken')) {
    authType = 'verifyToken';
    hasAuth = true;
  }

  // Vérifier si le rôle SUPER_ADMIN est vérifié
  if (content.includes("role !== 'SUPER_ADMIN'") || content.includes("role === 'SUPER_ADMIN'")) {
    hasAuth = true;
    if (authType === 'none') authType = 'verifyToken';
  }

  return {
    file: relativePath,
    hasAuth,
    authType,
    functions
  };
}

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
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
  console.log('🔍 AUDIT DES ROUTES /api/super-admin/*\n');

  const routeFiles = findRouteFiles(superAdminDir);
  const audits = routeFiles.map(auditRoute);

  const withAuth = audits.filter(a => a.hasAuth);
  const withoutAuth = audits.filter(a => !a.hasAuth);

  console.log(`📊 RÉSULTATS:`);
  console.log(`   Total routes: ${audits.length}`);
  console.log(`   ✅ Avec auth: ${withAuth.length}`);
  console.log(`   ❌ SANS auth: ${withoutAuth.length}\n`);

  if (withoutAuth.length > 0) {
    console.log('🚨 ROUTES SANS AUTHENTIFICATION (CRITIQUE):');
    withoutAuth.forEach(route => {
      console.log(`   ❌ ${route.file}`);
      console.log(`      Fonctions: ${route.functions.join(', ')}\n`);
    });
  }

  console.log('\n✅ ROUTES AVEC AUTHENTIFICATION:');
  withAuth.forEach(route => {
    console.log(`   ✅ ${route.file}`);
    console.log(`      Type: ${route.authType}`);
    console.log(`      Fonctions: ${route.functions.join(', ')}\n`);
  });

  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    total: audits.length,
    withAuth: withAuth.length,
    withoutAuth: withoutAuth.length,
    routes: audits
  };

  fs.writeFileSync(
    path.join(__dirname, '../AUDIT-SUPER-ADMIN-ROUTES.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 Rapport sauvegardé dans AUDIT-SUPER-ADMIN-ROUTES.json');

  if (withoutAuth.length > 0) {
    console.log(`\n⚠️  ${withoutAuth.length} routes SANS authentification trouvées !`);
    process.exit(1);
  } else {
    console.log('\n✅ Toutes les routes sont sécurisées !');
    process.exit(0);
  }
}

main();
