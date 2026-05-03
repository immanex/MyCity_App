import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        agent: {
          include: {
            agentMetadata: true,
          },
        },
        _count: {
          select: {
            inquiries: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}
