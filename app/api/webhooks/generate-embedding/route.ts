import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, secret } = await request.json();

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const text = `
      Property: ${property.title}
      Type: ${property.propertyType}
      Listing Type: ${property.listingType}
      Location: ${property.area}, ${property.city}
      Price: ${property.priceDisplay}
      Bedrooms: ${property.beds || 0}
      Bathrooms: ${property.baths || 0}
      Toilets: ${property.toilets || 0}
      Size: ${property.sqm ? property.sqm + ' sqm' : 'Unknown'}
      Description: ${property.description}
    `.trim().replace(/\n/g, ' ');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured.');
    }

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!res.ok) {
      throw new Error('Failed to generate embedding from OpenAI');
    }

    const data = await res.json();
    const vector = data.data[0].embedding;
    const pgVectorStr = `[${vector.join(',')}]`;

    // Upsert using raw query for the vector format
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "PropertyEmbedding" ("id", "propertyId", "embedding") 
      VALUES (gen_random_uuid(), $1, $2::vector)
      ON CONFLICT ("propertyId") 
      DO UPDATE SET embedding = $2::vector;
      `,
      propertyId,
      pgVectorStr
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating webhooks embedding:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
