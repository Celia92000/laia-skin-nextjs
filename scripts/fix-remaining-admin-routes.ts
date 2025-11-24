import * as fs from 'fs';

const filesToFix = [
  '/src/app/api/admin/social-media/auto-publish/route.ts',
  '/src/app/api/admin/social-media/upload/route.ts'
];

function generateAuthCode(requestParamName: string): string {
  return `
  // 🔒 Vérification Admin obligatoire
  const authHeader = ${requestParamName}.headers.get('authorization');
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
}

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
  // Pattern qui capture le nom du paramètre
  const regex = new RegExp(
    `(export async function ${functionName}\\((\\w+): (?:Next)?Request\\)\\s*\\{)`,
    'g'
  );

  return content.replace(regex, (match, openingPart, paramName) => {
    return match + generateAuthCode(paramName);
  });
}

for (const file of filesToFix) {
  const fullPath = process.cwd() + file;

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Vérifier si le fichier appelle réellement une fonction d'authentification
  // (pas juste si l'import existe)
  const hasAuthCall =
    /verifyToken\s*\(/.test(content) ||
    /verifyAuth\s*\(/.test(content) ||
    /requireAdmin\s*\(/.test(content) ||
    /requireSuperAdmin\s*\(/.test(content);

  if (hasAuthCall) {
    console.log(`⏭️  Fichier déjà sécurisé: ${file}`);
    continue;
  }

  // Ajouter l'import
  content = addImport(content);

  // Ajouter l'auth à toutes les fonctions HTTP
  const functions: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  let modified = false;
  for (const fn of functions) {
    if (content.includes(`export async function ${fn}`)) {
      const before = content;
      content = addAuthToFunction(content, fn);

      if (content !== before) {
        console.log(`✅ Ajout vérification Admin dans ${fn} de ${file}`);
        modified = true;
      }
    }
  }

  if (modified) {
    // Sauvegarder le fichier modifié
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fichier sécurisé: ${file}\n`);
  } else {
    console.log(`⏭️  Aucune modification nécessaire: ${file}\n`);
  }
}

console.log('\n🎉 Tous les fichiers ont été traités !');
