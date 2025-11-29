import { NextResponse } from 'next/server'

// Spécification OpenAPI complète pour LAIA Connect
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LAIA Connect API',
    version: '1.0.0',
    description: `
## API REST de LAIA Connect

LAIA Connect est une plateforme SaaS de gestion pour instituts de beauté.

### Authentification

La plupart des endpoints nécessitent une authentification via session NextAuth.
Les endpoints publics sont marqués comme tels.

### Rate Limiting

- Endpoints standards : 10 requêtes / 10 secondes
- Endpoints sensibles (login, paiement) : 5 requêtes / minute

### Multi-tenant

Chaque organisation a ses propres données isolées. Les requêtes sont automatiquement filtrées par organizationId.
    `,
    contact: {
      name: 'Support LAIA Connect',
      email: 'support@laiaconnect.fr',
      url: 'https://laiaconnect.fr',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://laiaconnect.fr',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000',
      description: 'Développement',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentification' },
    { name: 'Organizations', description: 'Gestion des organisations' },
    { name: 'Users', description: 'Gestion des utilisateurs' },
    { name: 'Services', description: 'Services/Prestations' },
    { name: 'Reservations', description: 'Réservations' },
    { name: 'Clients', description: 'Gestion clients' },
    { name: 'Invoices', description: 'Facturation' },
    { name: 'Super Admin', description: 'Administration plateforme' },
  ],
  paths: {
    // ========== AUTH ==========
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@institut.fr' },
                  password: { type: 'string', minLength: 8, example: '********' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Connexion réussie' },
          401: { description: 'Identifiants invalides' },
          429: { description: 'Trop de tentatives' },
        },
      },
    },

    // ========== SUPER ADMIN - ORGANIZATIONS ==========
    '/api/super-admin/organizations': {
      get: {
        tags: ['Super Admin', 'Organizations'],
        summary: 'Liste des organisations',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] } },
          { name: 'plan', in: 'query', schema: { type: 'string', enum: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Liste des organisations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    organizations: { type: 'array', items: { $ref: '#/components/schemas/Organization' } },
                    stats: { type: 'object' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          403: { description: 'Super admin requis' },
        },
      },
      post: {
        tags: ['Super Admin', 'Organizations'],
        summary: 'Créer une organisation',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'ownerEmail', 'plan'],
                properties: {
                  name: { type: 'string', example: 'Institut Beauté Paris' },
                  legalName: { type: 'string' },
                  ownerEmail: { type: 'string', format: 'email' },
                  ownerPhone: { type: 'string' },
                  plan: { type: 'string', enum: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'] },
                  siret: { type: 'string' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Organisation créée' },
          400: { description: 'Données invalides' },
          403: { description: 'Super admin requis' },
        },
      },
    },

    '/api/super-admin/organizations/{id}': {
      get: {
        tags: ['Super Admin', 'Organizations'],
        summary: 'Détails d\'une organisation',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Détails organisation' },
          404: { description: 'Organisation non trouvée' },
        },
      },
      put: {
        tags: ['Super Admin', 'Organizations'],
        summary: 'Modifier une organisation',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Organisation modifiée' },
          404: { description: 'Organisation non trouvée' },
        },
      },
      delete: {
        tags: ['Super Admin', 'Organizations'],
        summary: 'Supprimer une organisation',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Organisation supprimée' },
          404: { description: 'Organisation non trouvée' },
        },
      },
    },

    // ========== ADMIN - SERVICES ==========
    '/api/admin/services': {
      get: {
        tags: ['Services'],
        summary: 'Liste des services',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Liste des services',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Service' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Services'],
        summary: 'Créer un service',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceInput' },
            },
          },
        },
        responses: {
          201: { description: 'Service créé' },
        },
      },
    },

    // ========== ADMIN - RESERVATIONS ==========
    '/api/admin/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'Liste des réservations',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'staffId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Liste des réservations',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Reservation' } },
              },
            },
          },
        },
      },
    },

    // ========== ADMIN - CLIENTS ==========
    '/api/admin/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Liste des clients',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'tags', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Liste paginée des clients',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clients: { type: 'array', items: { $ref: '#/components/schemas/Client' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ========== ADMIN - INVOICES ==========
    '/api/admin/laia-invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'Factures LAIA Connect de l\'organisation',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Liste des factures',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Invoice' } },
              },
            },
          },
        },
      },
    },

    '/api/admin/laia-invoices/{id}/download': {
      get: {
        tags: ['Invoices'],
        summary: 'Télécharger une facture PDF',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Fichier PDF',
            content: { 'application/pdf': {} },
          },
          404: { description: 'Facture non trouvée' },
        },
      },
    },

    // ========== USAGE & QUOTAS ==========
    '/api/admin/usage': {
      get: {
        tags: ['Usage'],
        summary: 'Dashboard d\'utilisation et quotas',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Statistiques d\'utilisation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quotas: { type: 'object' },
                    totals: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ========== PUBLIC - BOOKING ==========
    '/api/public/services': {
      get: {
        tags: ['Public'],
        summary: 'Services disponibles (public)',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string' }, description: 'Slug de l\'organisation' },
        ],
        responses: {
          200: { description: 'Liste des services publics' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'Session NextAuth',
      },
    },
    schemas: {
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] },
          plan: { type: 'string', enum: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'] },
          ownerEmail: { type: 'string', format: 'email' },
          trialEndsAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'integer', description: 'Durée en minutes' },
          price: { type: 'number' },
          category: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      ServiceInput: {
        type: 'object',
        required: ['name', 'duration', 'price'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'integer' },
          price: { type: 'number' },
          category: { type: 'string' },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientId: { type: 'string' },
          serviceId: { type: 'string' },
          staffId: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
          paymentStatus: { type: 'string', enum: ['pending', 'paid', 'refunded'] },
        },
      },
      Client: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          totalSpent: { type: 'number' },
          visitCount: { type: 'integer' },
        },
      },
      Invoice: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          invoiceNumber: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] },
          issueDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}
