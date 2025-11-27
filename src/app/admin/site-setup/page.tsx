'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function SiteSetupPage() {
  const router = useRouter();

  useEffect(() => {
    // Déclencher l'ouverture du wizard inline sur la page /admin/
    const event = new CustomEvent('openConfigWizard');
    window.dispatchEvent(event);

    // Rediriger immédiatement vers /admin/
    router.replace('/admin');
  }, [router]);

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'admin']}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers la configuration...</p>
        </div>
      </div>
    </AuthGuard>
  );
}
