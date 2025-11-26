// TEST MINIMAL - Layout simplifié sans imports de composants
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Temporairement retiré: Header, Footer, etc. pour test */}
      {children}
    </div>
  );
}