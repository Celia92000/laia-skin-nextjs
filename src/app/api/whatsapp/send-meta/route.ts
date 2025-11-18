import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, formatPhoneNumber, whatsappTemplates } from '@/lib/whatsapp-meta';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, messageType, data } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et message requis' },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Construire le message selon le type
    let finalMessage = message;
    
    if (messageType === 'confirmation' && data) {
      finalMessage = whatsappTemplates.reservationConfirmation(data);
    } else if (messageType === 'reminder' && data) {
      finalMessage = whatsappTemplates.appointmentReminder(data);
    } else if (messageType === 'welcome' && data?.clientName) {
      finalMessage = whatsappTemplates.welcomeMessage(data.clientName);
    } else if (messageType === 'promotion' && data) {
      finalMessage = whatsappTemplates.promotionMessage(data);
    }

    // Envoyer le message
    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      message: finalMessage
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Message envoyé avec succès'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Erreur lors de l\'envoi du message' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    log.error('Erreur API WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message WhatsApp' },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier le statut d'un message
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'ID du message requis' },
        { status: 400 }
      );
    }

    const { getMessageStatus } = await import('@/lib/whatsapp-meta');
    const result = await getMessageStatus(messageId);

    return NextResponse.json(result);
  } catch (error) {
    log.error('Erreur vérification statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    );
  }
}