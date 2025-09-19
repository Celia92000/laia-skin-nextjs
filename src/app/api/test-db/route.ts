import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const serviceCount = await prisma.service.count();
    
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        active: true
      }
    });
    
    return NextResponse.json({
      success: true,
      database_url: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      is_vercel: process.env.VERCEL ? 'Yes' : 'No',
      service_count: serviceCount,
      services: services,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      database_url: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      is_vercel: process.env.VERCEL ? 'Yes' : 'No',
      error_code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}