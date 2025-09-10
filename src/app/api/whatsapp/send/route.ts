import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { to, message, template, templateData } = await request.json();
    
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let finalMessage = message;
    
    // Si un template est spécifié, l'utiliser
    if (template && templateData) {
      const { whatsappTemplates } = await import('@/lib/whatsapp');
      
      switch(template) {
        case 'confirmation':
          finalMessage = whatsappTemplates.reservationConfirmation(templateData);
          break;
        case 'reminder':
          finalMessage = whatsappTemplates.appointmentReminder(templateData);
          break;
        case 'birthday':
          finalMessage = whatsappTemplates.birthdayMessage(templateData);
          break;
        case 'followup':
          finalMessage = whatsappTemplates.afterCareFollowUp(templateData);
          break;
        case 'loyalty':
          finalMessage = whatsappTemplates.loyaltyUpdate(templateData);
          break;
        default:
          finalMessage = message;
      }
    }
    
    // Envoyer le message
    const result = await sendWhatsAppMessage({
      to,
      message: finalMessage
    });
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: 'Message envoyé avec succès' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Échec de l\'envoi du message' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}