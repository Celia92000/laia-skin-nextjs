'use client';

import { useRouter } from 'next/navigation';
import TemplatePreview from '@/components/TemplatePreview';

export default function PreviewTemplatePage() {
  const router = useRouter();

  const handlePurchase = async (config: any) => {
    // Save configuration to localStorage for checkout
    if (typeof window !== 'undefined') {
      localStorage.setItem('templateConfig', JSON.stringify(config));
    }

    // Log the configuration
    console.log('Template Configuration:', config);

    // Show confirmation message
    const confirmed = confirm(
      `Vous êtes sur le point de commander le template "${config.templateId.toUpperCase()}".\n\n` +
      `Organisation: ${config.organizationName}\n` +
      `Couleur principale: ${config.primaryColor}\n\n` +
      `Voulez-vous continuer vers le paiement?`
    );

    if (confirmed) {
      // In a real application, redirect to checkout with the template configuration
      // For now, we'll redirect to onboarding with template parameter
      router.push(`/onboarding?template=${config.templateId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplatePreview onPurchase={handlePurchase} />
    </div>
  );
}
