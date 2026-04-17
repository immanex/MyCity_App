import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // 1. Get the current property
    const currentProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!currentProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // 2. Find similar properties (same city & propertyType, ignore id)
    // In a real AI system, we'd use pgvector or an external recommendation engine.
    const similar = await prisma.property.findMany({
      where: {
        id: { not: id },
        city: currentProperty.city,
        propertyType: currentProperty.propertyType,
        status: 'AVAILABLE'
      },
      include: {
        images: true,
        agent: true
      },
      take: 3
    });

    // Formatting them similarly to standard properties
    const formatted = similar.map(p => ({
      ...p,
      priceDisplay: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p.priceNumeric)
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
