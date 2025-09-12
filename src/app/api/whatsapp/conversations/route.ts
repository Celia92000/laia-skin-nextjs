import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les conversations
export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les conversations avec les derniers messages
    const conversations = await prisma.user.findMany({
      where: {
        phone: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        // lastMessageTime: true, // TODO: Ajouter ces champs au modèle User
        // lastMessage: true,
        // unreadCount: true
      },
      // orderBy: {
      //   lastMessageTime: 'desc'
      // }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, templateId, mediaUrl } = body;

    // Ici, intégration avec l'API WhatsApp Business
    // Pour le moment, on simule l'envoi
    
    // TODO: Enregistrer le message dans la base de données
    // Note: Les champs lastMessage, lastMessageTime et unreadCount doivent être ajoutés au modèle User
    // Et phone n'est pas un champ unique, il faut utiliser findFirst puis update par id
    /*
    const user = await prisma.user.findFirst({
      where: { phone }
    });
    
    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastMessage: message,
          lastMessageTime: new Date(),
          unreadCount: 0
        }
      });
    }
    */

    // Simuler l'envoi WhatsApp
    const response = {
      success: true,
      messageId: `msg_${Date.now()}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}