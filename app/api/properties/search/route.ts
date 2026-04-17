import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Simple search for now, can be improved with full-text search index later
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { area: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        area: true,
        city: true,
        priceDisplay: true,
        images: {
          where: { isCover: true },
          take: 1,
        },
      },
      take: 5,
    });

    const results = properties.map(p => ({
      id: p.id,
      title: p.title,
      area: p.area,
      city: p.city,
      priceDisplay: p.priceDisplay,
      coverImage: p.images[0]?.imageUrl || null,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
