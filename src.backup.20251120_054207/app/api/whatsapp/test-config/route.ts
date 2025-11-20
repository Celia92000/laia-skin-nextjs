import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test avec l'API Graph de Meta pour trouver le bon ID
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    // Essayer de récupérer les infos du compte
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${businessId}?fields=id,name,phone_numbers&access_token=${token}`
    );
    
    const data = await response.json();
    
    // Essayer aussi avec l'endpoint me
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${token}`
    );
    
    const meData = await meResponse.json();
    
    // Essayer de lister les apps
    const appsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`
    );
    
    const appsData = await appsResponse.json();

    return NextResponse.json({
      config: {
        token: token ? 'Configuré (masqué)' : 'Non configuré',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessId: businessId,
      },
      businessInfo: data,
      meInfo: meData,
      appsInfo: appsData,
      help: {
        message: 'Vérifiez les données ci-dessus pour trouver le bon Phone Number ID',
        tips: [
          'Le Phone Number ID doit être celui du numéro de TEST',
          'Il devrait y avoir un numéro commençant par +1 555',
          'Cherchez un ID à 15-16 chiffres associé à ce numéro test'
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      details: 'Erreur lors du test de configuration'
    }, { status: 500 });
  }
}