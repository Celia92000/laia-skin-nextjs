'use client';

import { useRouter } from 'next/navigation';
import CompleteOnboardingWizard from '@/components/CompleteOnboardingWizard';
import AuthGuard from '@/components/AuthGuard';

export default function SiteSetupPage() {
  const router = useRouter();

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'admin']}>
      <CompleteOnboardingWizard
        onComplete={() => {
          // Rediriger vers l'admin après complétion
          router.push('/admin');
        }}
      />
    </AuthGuard>
  );
}
