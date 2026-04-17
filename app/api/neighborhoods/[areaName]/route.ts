import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ areaName: string }> }) {
  try {
    const { areaName } = await params;
    
    // areaName is slugified, e.g. "lekki-phase-1"
    // We need to find the neighborhood. We can do a case-insensitive search or replace hyphens with spaces.
    // Let's replace hyphens with spaces for a simple match, or use a contains query.
    const searchName = decodeURIComponent(areaName).replace(/-/g, ' ');

    const neighborhood = await prisma.neighborhood.findFirst({
      where: {
        areaName: {
          equals: searchName,
          mode: 'insensitive'
        }
      }
    });

    if (!neighborhood) {
      return NextResponse.json({ error: 'Neighborhood not found' }, { status: 404 });
    }

    return NextResponse.json(neighborhood);
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    return NextResponse.json({ error: 'Failed to fetch neighborhood' }, { status: 500 });
  }
}
