import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les clients
    const clients = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CLIENT' },
          { role: 'CLIENT' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        lastVisit: true,
        totalSpent: true,
        birthDate: true,
        skinType: true,
        allergies: true,
        medicalNotes: true,
        preferences: true,
        adminNotes: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📱 API Clients: ${clients.length} clients trouvés`);
    
    // Log les clients avec téléphone pour debug
    const clientsWithPhone = clients.filter(c => c.phone);
    console.log(`📞 Clients avec téléphone: ${clientsWithPhone.length}`);
    clientsWithPhone.forEach(c => {
      console.log(`  - ${c.name}: ${c.phone}`);
    });

    return NextResponse.json(clients);

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, birthDate, skinType, allergies, medicalNotes, preferences, adminNotes } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Un client avec cet email existe déjà' }, { status: 400 });
    }

    // Créer le nouveau client
    const newClient = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: `temp_${Date.now()}`, // Mot de passe temporaire
        role: 'CLIENT',
        birthDate: birthDate ? new Date(birthDate) : null,
        skinType: skinType || null,
        allergies: allergies || null,
        medicalNotes: medicalNotes || null,
        preferences: preferences || null,
        adminNotes: adminNotes || null
      }
    });

    console.log(`✅ Nouveau client créé: ${newClient.name}`);

    return NextResponse.json({
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone
    });

  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}