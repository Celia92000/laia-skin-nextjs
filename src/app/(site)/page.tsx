// TEST MINIMAL pour isoler l'erreur ENOENT
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = false;

export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Test - Site en construction</h1>
      <p>Version minimale pour debug Vercel</p>
    </div>
  );
}
