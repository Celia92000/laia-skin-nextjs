import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
    DATABASE_URL_VALUE: process.env.DATABASE_URL?.substring(0, 30) + '...',
    NODE_ENV: process.env.NODE_ENV
  });
}