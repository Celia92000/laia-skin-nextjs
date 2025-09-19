import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json({
        connected: false,
        error: 'Configuration WhatsApp manquante',
        accountInfo: {
          hasToken: false,
          phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        }
      });
    }

    // Vérifier la connexion avec l'API Meta/WhatsApp
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        return NextResponse.json({
          connected: true,
          accountInfo: {
            id: WHATSAPP_BUSINESS_ACCOUNT_ID,
            phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
            displayPhoneNumber: data.display_phone_number || '0683717050',
            verifiedName: data.verified_name || 'LAIA SKIN Institut',
            hasToken: true,
            qualityRating: data.quality_rating || 'GREEN',
            platform: data.platform || 'WHATSAPP'
          }
        });
      } else {
        return NextResponse.json({
          connected: false,
          error: data.error?.message || 'Connexion WhatsApp impossible',
          accountInfo: {
            hasToken: true,
            phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
          }
        });
      }
    } catch (error) {
      return NextResponse.json({
        connected: false,
        error: 'Erreur de connexion à l\'API WhatsApp',
        accountInfo: {
          hasToken: true,
          phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        }
      });
    }
  } catch (error) {
    console.error('Erreur status WhatsApp:', error);
    return NextResponse.json({ 
      connected: false,
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}