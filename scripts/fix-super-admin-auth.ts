import * as fs from 'fs';

const filesToFix = [
  '/src/app/api/super-admin/funnel/laia-connect/route.ts',
  '/src/app/api/super-admin/invoice-settings/route.ts',
  '/src/app/api/super-admin/metrics/route.ts',
  '/src/app/api/super-admin/subscription/manage/route.ts',
  '/src/app/api/super-admin/workflows/auto-execute/route.ts'
];

const authCode = `
    // 🔒 Vérification SUPER_ADMIN obligatoire
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
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
  const regex = new RegExp(`export async function ${functionName}\\(request: NextRequest\\) \\{\\s*try \\{`, 'g');

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
      console.log(`✅ Ajout vérification SUPER_ADMIN dans ${fn} de ${file}`);
    }
  }

  // Sauvegarder le fichier modifié
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Fichier sécurisé: ${file}\n`);
}

console.log('\n🎉 Tous les fichiers ont été sécurisés !');
