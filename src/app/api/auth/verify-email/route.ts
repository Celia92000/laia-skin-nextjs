import { NextRequest, NextResponse } from 'next/server';
import { verifyUserEmail, resendVerificationEmail } from '@/lib/email-verification';

/**
 * GET /api/auth/verify-email?token=xxx
 * Vérifie l'email de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    const result = await verifyUserEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erreur vérification email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Renvoie un email de vérification
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email manquant' },
        { status: 400 }
      );
    }

    const result = await resendVerificationEmail(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erreur renvoie email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
