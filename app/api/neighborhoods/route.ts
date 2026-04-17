import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const neighborhoods = await prisma.neighborhood.findMany();
    return NextResponse.json(neighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return NextResponse.json({ error: 'Failed to fetch neighborhoods' }, { status: 500 });
  }
}
