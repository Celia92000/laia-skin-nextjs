import * as fs from 'fs';

const filesToFix = [
  '/src/app/api/admin/api-tokens/[id]/renew/route.ts',
  '/src/app/api/admin/api-tokens/check-expiring/route.ts',
  '/src/app/api/admin/api-tokens/route.ts',
  '/src/app/api/admin/assign-template/route.ts',
  '/src/app/api/admin/clients/import/route.ts',
  '/src/app/api/admin/config-completion/route.ts',
  '/src/app/api/admin/evolutions/route.ts',
  '/src/app/api/admin/features/check-access/route.ts',
  '/src/app/api/admin/google-reviews/sync/route.ts',
  '/src/app/api/admin/locations/[id]/route.ts',
  '/src/app/api/admin/locations/route.ts',
  '/src/app/api/admin/loyalty-settings/route.ts',
  '/src/app/api/admin/organization/info/route.ts',
  '/src/app/api/admin/photo-sessions/route.ts',
  '/src/app/api/admin/push/send/route.ts',
  '/src/app/api/admin/quick-login/route.ts',
  '/src/app/api/admin/social-media/analyze-feed/route.ts',
  '/src/app/api/admin/social-media/auto-publish/route.ts',
  '/src/app/api/admin/social-media/generate-content-ideas/route.ts',
  '/src/app/api/admin/social-media/insights/route.ts',
  '/src/app/api/admin/social-media/trending-posts/route.ts',
  '/src/app/api/admin/social-media/upload/route.ts',
  '/src/app/api/admin/stats/route.ts',
  '/src/app/api/admin/subscription/cancel/route.ts',
  '/src/app/api/admin/subscription/change-plan/route.ts',
  '/src/app/api/admin/users/check-limit/route.ts'
];

const authCode = `
    // 🔒 Vérification Admin obligatoire
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a un rôle admin
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
    }
`;

function addImport(content: string): string {
  // Vérifier si verifyToken est déjà importé
  if (content.includes("from '@/lib/auth'")) {
    return content;
  }

  // Trouver la dernière ligne d'import
  const importRegex = /^import .* from .*;$/gm;
  let lastImportIndex = 0;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = importRegex.lastIndex;
  }

  // Insérer l'import après la dernière import
  const before = content.substring(0, lastImportIndex);
  const after = content.substring(lastImportIndex);

  return before + "\nimport { verifyToken } from '@/lib/auth';" + after;
}

function addAuthToFunction(content: string, functionName: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): string {
  const regex = new RegExp(`export async function ${functionName}\\\\(request: NextRequest\\\\) \\\\{\\\\s*try \\\\{`, 'g');

  return content.replace(regex, (match) => {
    return match + authCode;
  });
}

for (const file of filesToFix) {
  const fullPath = process.cwd() + file;

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Ajouter l'import
  content = addImport(content);

  // Ajouter l'auth à toutes les fonctions HTTP
  const functions: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  for (const fn of functions) {
    if (content.includes(`export async function ${fn}`)) {
      content = addAuthToFunction(content, fn);
      console.log(`✅ Ajout vérification Admin dans ${fn} de ${file}`);
    }
  }

  // Sauvegarder le fichier modifié
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Fichier sécurisé: ${file}\n`);
}

console.log('\n🎉 Tous les fichiers ont été sécurisés !');
