import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
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

### Codes de réponse

- \`200\` : Succès
- \`201\` : Ressource créée
- \`400\` : Requête invalide
- \`401\` : Non authentifié
- \`403\` : Non autorisé
- \`404\` : Ressource non trouvée
- \`429\` : Trop de requêtes (rate limit)
- \`500\` : Erreur serveur
        `,
        contact: {
          name: 'Support LAIA Connect',
          email: 'support@laiaconnect.fr',
          url: 'https://laiaconnect.fr',
        },
        license: {
          name: 'Propriétaire',
          url: 'https://laiaconnect.fr/cgv-laia-connect',
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://laiaconnect.fr',
          description: 'Production',
        },
        {
          url: 'http://localhost:3000',
          description: 'Développement local',
        },
      ],
      tags: [
        {
          name: 'Auth',
          description: 'Authentification et gestion des sessions',
        },
        {
          name: 'Organizations',
          description: 'Gestion des organisations (instituts)',
        },
        {
          name: 'Users',
          description: 'Gestion des utilisateurs',
        },
        {
          name: 'Services',
          description: 'Gestion des services/prestations',
        },
        {
          name: 'Reservations',
          description: 'Gestion des réservations',
        },
        {
          name: 'Clients',
          description: 'Gestion des clients',
        },
        {
          name: 'Invoices',
          description: 'Facturation et paiements',
        },
        {
          name: 'Super Admin',
          description: 'Endpoints réservés aux super-administrateurs',
        },
      ],
      components: {
        securitySchemes: {
          sessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'next-auth.session-token',
            description: 'Session NextAuth (cookie automatique)',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Message d\'erreur',
              },
              code: {
                type: 'string',
                description: 'Code d\'erreur',
              },
            },
          },
          Organization: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              slug: { type: 'string' },
              status: {
                type: 'string',
                enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']
              },
              plan: {
                type: 'string',
                enum: ['SOLO', 'DUO', 'TEAM', 'PREMIUM']
              },
              ownerEmail: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: {
                type: 'string',
                enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'STAFF', 'RECEPTIONIST', 'CLIENT']
              },
              organizationId: { type: 'string', format: 'uuid' },
            },
          },
          Service: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string' },
              duration: { type: 'integer', description: 'Durée en minutes' },
              price: { type: 'number', format: 'float' },
              category: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
          Reservation: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              clientId: { type: 'string', format: 'uuid' },
              serviceId: { type: 'string', format: 'uuid' },
              staffId: { type: 'string', format: 'uuid' },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              status: {
                type: 'string',
                enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
              },
              paymentStatus: {
                type: 'string',
                enum: ['pending', 'paid', 'refunded']
              },
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
              notes: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
          },
          Invoice: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              invoiceNumber: { type: 'string' },
              amount: { type: 'number', format: 'float' },
              status: {
                type: 'string',
                enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']
              },
              issueDate: { type: 'string', format: 'date-time' },
              dueDate: { type: 'string', format: 'date-time' },
              paidAt: { type: 'string', format: 'date-time', nullable: true },
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
        },
      },
      security: [
        {
          sessionAuth: [],
        },
      ],
    },
  })

  return spec
}

// Spécifications manuelles pour les endpoints principaux
export const apiEndpoints = {
  // Auth
  'POST /api/auth/login': {
    summary: 'Connexion utilisateur',
    tags: ['Auth'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
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

  // Organizations (Super Admin)
  'GET /api/super-admin/organizations': {
    summary: 'Liste des organisations',
    tags: ['Super Admin', 'Organizations'],
    parameters: [
      { name: 'status', in: 'query', schema: { type: 'string' } },
      { name: 'plan', in: 'query', schema: { type: 'string' } },
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
                organizations: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Organization' },
                },
                stats: { type: 'object' },
              },
            },
          },
        },
      },
      401: { description: 'Non authentifié' },
      403: { description: 'Non autorisé (super admin requis)' },
    },
  },

  'POST /api/super-admin/organizations': {
    summary: 'Créer une organisation',
    tags: ['Super Admin', 'Organizations'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'ownerEmail', 'plan'],
            properties: {
              name: { type: 'string' },
              legalName: { type: 'string' },
              ownerEmail: { type: 'string', format: 'email' },
              ownerPhone: { type: 'string' },
              plan: { type: 'string', enum: ['SOLO', 'DUO', 'TEAM', 'PREMIUM'] },
              siret: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Organisation créée' },
      400: { description: 'Données invalides' },
      401: { description: 'Non authentifié' },
      403: { description: 'Non autorisé' },
    },
  },

  // Services (Admin)
  'GET /api/admin/services': {
    summary: 'Liste des services',
    tags: ['Services'],
    responses: {
      200: {
        description: 'Liste des services',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Service' },
            },
          },
        },
      },
    },
  },

  // Reservations (Admin)
  'GET /api/admin/reservations': {
    summary: 'Liste des réservations',
    tags: ['Reservations'],
    parameters: [
      { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
      { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      { name: 'status', in: 'query', schema: { type: 'string' } },
    ],
    responses: {
      200: {
        description: 'Liste des réservations',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Reservation' },
            },
          },
        },
      },
    },
  },

  // Clients (Admin)
  'GET /api/admin/clients': {
    summary: 'Liste des clients',
    tags: ['Clients'],
    parameters: [
      { name: 'search', in: 'query', schema: { type: 'string' } },
      { name: 'page', in: 'query', schema: { type: 'integer' } },
      { name: 'limit', in: 'query', schema: { type: 'integer' } },
    ],
    responses: {
      200: {
        description: 'Liste des clients avec pagination',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clients: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Client' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },
      },
    },
  },

  // Invoices (Admin)
  'GET /api/admin/laia-invoices': {
    summary: 'Liste des factures LAIA Connect',
    tags: ['Invoices'],
    responses: {
      200: {
        description: 'Liste des factures',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Invoice' },
            },
          },
        },
      },
    },
  },
}
