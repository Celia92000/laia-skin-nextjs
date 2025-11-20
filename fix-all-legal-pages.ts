import fs from 'fs';

const pages = [
  { file: 'src/app/(site)/cgv/page.tsx', title: 'CGV' },
  { file: 'src/app/(site)/politique-de-confidentialite/page.tsx', title: 'Politique de confidentialité' },
  { file: 'src/app/(site)/conditions-utilisation/page.tsx', title: 'Conditions d\'utilisation' }
];

console.log('🎨 Correction des pages légales...\n');

const getOrganizationCode = `  // Récupérer l'organisation par domaine
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  let organization = null;

  // Sur localhost, forcer Laia Skin Institut
  if (cleanHost.includes('localhost')) {
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { config: true }
    });
  } else {
    const parts = cleanHost.split('.');
    const subdomain = parts.length > 1 && parts[0] !== 'www' ? parts[0] : 'laia-skin-institut';

    const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
      prisma.organization.findUnique({
        where: { domain: cleanHost },
        include: { config: true }
      }),
      prisma.organization.findUnique({
        where: { subdomain: subdomain },
        include: { config: true }
      }),
      prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { config: true }
      })
    ]);

    organization = orgByDomain || orgBySubdomain || orgBySlug;
  }

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  const config = organization.config || {};

  // Couleurs dynamiques
  const accentColor = config.accentColor || '#2c3e50';`;

pages.forEach(({ file, title }) => {
  if (!fs.existsSync(file)) {
    console.log(`⏭️  ${title}: fichier n'existe pas`);
    return;
  }

  let content = fs.readFileSync(file, 'utf-8');

  // Remplacer l'import
  content = content.replace(
    `import { getSiteConfigFull } from '@/lib/config-service';`,
    `import { headers } from 'next/headers';\nimport { prisma } from '@/lib/prisma';`
  );

  // Remplacer la récupération de config
  content = content.replace(
    /export default async function \w+\(\) \{\n  const config = await getSiteConfigFull\(\);/,
    (match) => {
      const funcName = match.match(/function (\w+)/)?.[1] || 'Page';
      return `export default async function ${funcName}() {\n${getOrganizationCode}`;
    }
  );

  // Remplacer les couleurs hardcodées
  content = content.replace(/text-\[#2c3e50\]/g, '');
  content = content.replace(
    /className="text-4xl font-light mb-8 tracking-wide uppercase text-center"/g,
    'className="text-4xl font-light mb-8 tracking-wide uppercase text-center" style={{ color: accentColor }}'
  );
  content = content.replace(
    /className="text-xl font-medium mb-4 uppercase tracking-wide"/g,
    'className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}'
  );
  content = content.replace(
    /className="text-sm \/70 font-light leading-relaxed"/g,
    'className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}'
  );
  content = content.replace(
    /className="text-sm font-light leading-relaxed"/g,
    'className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}'
  );

  // Ajouter mention LAIA si pas déjà présente
  if (!content.includes('LAIA Connect')) {
    content = content.replace(
      /([ \t]*)<\/div>\s*<\/div>\s*<\/main>/,
      `$1    <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
$1      <p className="text-xs text-center font-light" style={{ color: \`\${accentColor}80\` }}>
$1        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
$1      </p>
$1      <p className="text-xs text-center font-light" style={{ color: \`\${accentColor}60\` }}>
$1        Plateforme éditée par <strong>LAIA Connect</strong> - Solution de gestion pour instituts de beauté
$1      </p>
$1    </div>
$1  </div>
$1</div>
$1</main>`
    );
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`✅ ${title}: mis à jour`);
});

console.log('\n✨ Toutes les pages légales sont maintenant multi-tenant avec couleurs dynamiques et mention LAIA !');
