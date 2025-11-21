import fs from 'fs';
import path from 'path';

interface AuditResult {
  file: string;
  hasTenantFilter: boolean;
  hasOrganizationId: boolean;
  risk: 'high' | 'medium' | 'low';
  details: string;
}

const results: AuditResult[] = [];

// APIs critiques à vérifier
const criticalApis = [
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/clients/route.ts',
  'src/app/api/admin/reservations/route.ts',
  'src/app/api/admin/statistics/route.ts',
  'src/app/api/admin/services/route.ts',
  'src/app/api/admin/products/route.ts',
  'src/app/api/admin/revenue-stats/route.ts',
  'src/app/api/admin/loyalty/route.ts',
  'src/app/api/services/route.ts',
  'src/app/api/products/route.ts',
];

function auditFile(filePath: string): AuditResult {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      file: filePath,
      hasTenantFilter: false,
      hasOrganizationId: false,
      risk: 'medium',
      details: 'Fichier non trouvé'
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Vérifier si le fichier contient des filtres par organizationId
  const hasOrganizationIdFilter = content.includes('organizationId:') ||
                                   content.includes('organizationId =') ||
                                   content.includes('organizationId,');

  const hasDecodedOrgId = content.includes('decoded.organizationId');
  const hasPrismaFilter = content.includes('where: {') && hasOrganizationIdFilter;

  let risk: 'high' | 'medium' | 'low' = 'low';
  let details = '';

  // Vérifier si c'est une route GET (lecture de données)
  const isGetRoute = content.includes('export async function GET');
  const isPostRoute = content.includes('export async function POST');

  if (isGetRoute && !hasPrismaFilter) {
    risk = 'high';
    details = '⚠️ CRITIQUE: Route GET sans filtre organizationId - Fuite de données possible !';
  } else if (isPostRoute && !hasDecodedOrgId) {
    risk = 'medium';
    details = '⚠️ MOYEN: Route POST sans organizationId - Création cross-tenant possible';
  } else if (hasPrismaFilter && hasDecodedOrgId) {
    risk = 'low';
    details = '✅ OK: Filtre organizationId présent';
  } else if (hasOrganizationIdFilter) {
    risk = 'low';
    details = '✅ OK: organizationId trouvé dans le code';
  } else {
    risk = 'medium';
    details = '⚠️ À vérifier: Pas de filtre organizationId évident';
  }

  return {
    file: filePath,
    hasTenantFilter: hasPrismaFilter,
    hasOrganizationId: hasDecodedOrgId || hasOrganizationIdFilter,
    risk,
    details
  };
}

console.log('🔍 AUDIT MULTI-TENANCY\n');
console.log('=====================================\n');

for (const apiPath of criticalApis) {
  const result = auditFile(apiPath);
  results.push(result);

  const icon = result.risk === 'high' ? '🔴' : result.risk === 'medium' ? '🟡' : '🟢';
  console.log(`${icon} ${result.file}`);
  console.log(`   ${result.details}`);
  console.log('');
}

console.log('\n=====================================');
console.log('📊 RÉSUMÉ\n');

const highRisk = results.filter(r => r.risk === 'high').length;
const mediumRisk = results.filter(r => r.risk === 'medium').length;
const lowRisk = results.filter(r => r.risk === 'low').length;

console.log(`🔴 Risque ÉLEVÉ: ${highRisk}`);
console.log(`🟡 Risque MOYEN: ${mediumRisk}`);
console.log(`🟢 Risque FAIBLE: ${lowRisk}`);

if (highRisk > 0) {
  console.log('\n❌ ACTION REQUISE: Des APIs critiques ne sont pas isolées !');
  process.exit(1);
} else if (mediumRisk > 0) {
  console.log('\n⚠️ ATTENTION: Vérification manuelle recommandée');
} else {
  console.log('\n✅ Toutes les APIs critiques semblent isolées par organisation');
}
