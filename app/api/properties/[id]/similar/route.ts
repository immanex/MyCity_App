import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // 1. Get the current property and its embedding
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        embedding: true
      }
    });

    if (!currentProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    let similarProperties = [];

    // 2. Perform vector similarity search if embedding exists
    if (currentProperty.embedding) {
      // Find structurally similar properties based on vector distance
      // Using <-> operator for Euclidean distance. 
      // Replace with <=> for Cosine distance if embeddings are normalized.
      const vectorResults = await prisma.$queryRaw`
        SELECT
          p.id,
          1 - (pe.embedding <=> (SELECT embedding FROM "PropertyEmbedding" WHERE "propertyId" = ${id})) as similarity
        FROM "Property" p
        JOIN "PropertyEmbedding" pe ON p.id = pe."propertyId"
        WHERE p.id != ${id} AND p.status = 'AVAILABLE'
        ORDER BY pe.embedding <=> (SELECT embedding FROM "PropertyEmbedding" WHERE "propertyId" = ${id})
        LIMIT 3
      `;

      const ids = (vectorResults as any[]).map(r => r.id);
      
      if (ids.length > 0) {
        similarProperties = await prisma.property.findMany({
          where: { id: { in: ids } },
          include: { images: true, agent: true }
        });
        
        // Re-sort results to match query order
        similarProperties.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      }
    }

    // 3. Fallback to basic matching if no embeddings or vector search failed
    if (similarProperties.length === 0) {
      similarProperties = await prisma.property.findMany({
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
    }

    // Formatting them similarly to standard properties
    const formatted = similarProperties.map(p => ({
      ...p,
      priceDisplay: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p.priceNumeric)
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
