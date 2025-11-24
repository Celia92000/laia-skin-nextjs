# Template Previewer Integration Guide

This guide shows how to integrate the Template Previewer into various parts of your application.

## Quick Start

Access the previewer at: `/preview-template`

```typescript
import Link from 'next/link';

export default function YourComponent() {
  return (
    <Link
      href="/preview-template"
      className="btn btn-primary"
    >
      Prévisualiser les Templates
    </Link>
  );
}
```

## Integration Examples

### 1. Super Admin - Template Management

Add a "Preview" button to the template management interface:

```typescript
// /src/app/(super-admin)/super-admin/templates/page.tsx

import Link from 'next/link';

export default function TemplatesPage() {
  return (
    <div>
      <h1>Gestion des Templates</h1>

      {/* Add Preview Button */}
      <Link
        href="/preview-template"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span>👁️</span>
        <span>Prévisualiser les Templates</span>
      </Link>

      {/* Rest of your template management UI */}
    </div>
  );
}
```

### 2. Onboarding Flow

Pre-select template from previewer configuration:

```typescript
// /src/app/(platform)/onboarding/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TemplateConfig {
  templateId: string;
  organizationName: string;
  primaryColor: string;
  // ... other fields
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<TemplateConfig | null>(null);

  useEffect(() => {
    // Get template ID from URL
    const templateId = searchParams.get('template');

    // Get full config from localStorage
    const savedConfig = localStorage.getItem('templateConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);

      // Clear localStorage after reading
      localStorage.removeItem('templateConfig');
    }
  }, [searchParams]);

  // Use config to pre-fill form
  return (
    <div>
      <h1>Configuration de votre Institut</h1>

      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ✓ Template sélectionné: <strong>{config.templateId.toUpperCase()}</strong>
          </p>
          <p className="text-sm text-blue-800">
            ✓ Organisation: <strong>{config.organizationName}</strong>
          </p>
        </div>
      )}

      {/* Onboarding form with pre-filled values */}
      <form>
        <input
          type="text"
          defaultValue={config?.organizationName || ''}
          placeholder="Nom de l'organisation"
        />
        <input
          type="color"
          defaultValue={config?.primaryColor || '#000000'}
        />
        {/* ... other fields */}
      </form>
    </div>
  );
}
```

### 3. Marketing/Landing Page

Add prominent CTA to preview templates:

```typescript
// /src/app/(marketing)/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Choisissez votre Template Parfait
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            13 templates professionnels, personnalisables en temps réel
          </p>

          <Link
            href="/preview-template"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            <span>🎨</span>
            <span>Essayer le Prévisualisateur</span>
            <span>→</span>
          </Link>
        </div>

        {/* Template Grid Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Template cards... */}
        </div>
      </div>
    </section>
  );
}
```

### 4. Admin Panel - Template Switcher

Allow organization admin to preview before switching templates:

```typescript
// /src/components/TemplateSwitcher.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TemplateSwitcherProps {
  currentTemplateId: string;
  organizationId: string;
}

export default function TemplateSwitcher({ currentTemplateId, organizationId }: TemplateSwitcherProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newTemplateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir changer de template?')) {
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch('/api/organization/template', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          templateId: newTemplateId
        })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to change template:', error);
      alert('Erreur lors du changement de template');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Changer de Template</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Template actuel</p>
            <p className="font-semibold">{currentTemplateId.toUpperCase()}</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
            Actif
          </span>
        </div>

        {/* Preview Button */}
        <Link
          href="/preview-template"
          target="_blank"
          className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
        >
          Prévisualiser d'autres templates
        </Link>

        {/* Template Selection */}
        <select
          onChange={(e) => handleChange(e.target.value)}
          disabled={isChanging}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Changer vers...</option>
          <option value="laia">LAIA (Premium)</option>
          <option value="modern">Modern (Premium)</option>
          <option value="luxe">Luxe (Premium)</option>
          <option value="elegance">Elegance (Premium)</option>
          <option value="spaluxe">Spa Luxe (Premium)</option>
          <option value="medical">Medical (Premium)</option>
          <option value="lasertech">Laser Tech (Premium)</option>
          <option value="professional">Professional (Solo)</option>
          <option value="classic">Classic (Solo)</option>
          <option value="minimal">Minimal (Solo)</option>
          <option value="fresh">Fresh (Solo)</option>
          <option value="zen">Zen (Solo)</option>
          <option value="boutique">Boutique (Solo)</option>
        </select>

        {isChanging && (
          <p className="text-sm text-gray-600 text-center">
            Changement en cours...
          </p>
        )}
      </div>
    </div>
  );
}
```

### 5. Pricing Page

Link templates to pricing tiers:

```typescript
// /src/app/(marketing)/pricing/page.tsx

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="py-20">
      <h1 className="text-4xl font-bold text-center mb-12">Nos Offres</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* SOLO Plan */}
        <div className="border rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Plan SOLO</h2>
          <p className="text-4xl font-bold mb-6">49€<span className="text-lg">/mois</span></p>

          <ul className="space-y-3 mb-8">
            <li>✓ 6 templates professionnels</li>
            <li>✓ Personnalisation complète</li>
            <li>✓ Support standard</li>
          </ul>

          <Link
            href="/preview-template"
            className="block w-full py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Prévisualiser les templates SOLO
          </Link>
        </div>

        {/* PREMIUM Plan */}
        <div className="border-4 border-purple-500 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
            POPULAIRE
          </div>

          <h2 className="text-2xl font-bold mb-4">Plan PREMIUM</h2>
          <p className="text-4xl font-bold mb-6">99€<span className="text-lg">/mois</span></p>

          <ul className="space-y-3 mb-8">
            <li>✓ 13 templates premium</li>
            <li>✓ Personnalisation avancée</li>
            <li>✓ Support prioritaire</li>
            <li>✓ Fonctionnalités exclusives</li>
          </ul>

          <Link
            href="/preview-template"
            className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-xl transition-all"
          >
            Prévisualiser tous les templates
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 6. Email Template

Include preview link in welcome email:

```typescript
// /src/emails/welcome-email.tsx

import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  organizationName: string;
}

export default function WelcomeEmail({ userName, organizationName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            Bienvenue {userName} !
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
            Merci d'avoir rejoint LAIA Connect pour {organizationName}.
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '20px' }}>
            Commencez par personnaliser votre site web avec notre prévisualisateur de templates :
          </Text>

          <Button
            href="https://yourdomain.com/preview-template"
            style={{
              backgroundColor: '#0066cc',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block',
              marginTop: '20px'
            }}
          >
            Prévisualiser les Templates
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

## API Integration

### Save Template Configuration

```typescript
// /src/app/api/organization/template/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, templateId, primaryColor, secondaryColor, accentColor } = body;

    // Verify user has access to organization
    const org = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: {
            id: auth.userId
          }
        }
      }
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Update organization template
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        templateId,
        primaryColor,
        secondaryColor,
        accentColor,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      organization: updated
    });

  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
```

### Load Template Configuration

```typescript
// /src/lib/template-config.ts

import prisma from '@/lib/prisma';

export async function getTemplateConfig(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      templateId: true,
      name: true,
      description: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      heroImage: true,
      heroVideo: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      postalCode: true
    }
  });

  return org;
}
```

## Best Practices

1. **Always validate user input** before saving to database
2. **Sanitize file uploads** to prevent security issues
3. **Use localStorage** only for temporary config storage
4. **Clear localStorage** after reading config
5. **Provide fallback values** if config is missing
6. **Show loading states** during template switching
7. **Confirm before changing** template (data loss warning)
8. **Test on multiple devices** before deploying

## Troubleshooting

### Config not persisting
- Check localStorage browser support
- Verify no browser extensions blocking localStorage
- Check for localStorage quota exceeded

### Template not updating
- Clear browser cache
- Check if organizationId is correct
- Verify API endpoint is working
- Check network tab for errors

### Files not uploading
- Check file size limits
- Verify file type is supported
- Check temp directory permissions
- Monitor disk space

## Support

For integration issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Server logs for API errors
4. Database for saved configurations
