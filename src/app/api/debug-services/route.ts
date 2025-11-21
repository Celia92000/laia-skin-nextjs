import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET() {
  try {
    log.info('🔍 Debug: Récupération des services...');
    log.info('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    log.info('VERCEL env:', !!process.env.VERCEL);
    
    const services = await prisma.service.findMany({
      where: { active: true }
    });
    
    return NextResponse.json({
      success: true,
      count: services.length,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        price: s.price,
        description: s.description,
        active: s.active
      })),
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error: any) {
    log.error('❌ Erreur debug services:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}