import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateEmbeddingText(property: any) {
  // Construct a logical, clean text block for semantic text search
  return `
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
}

async function fetchOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
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
    const err = await res.json();
    throw new Error(`OpenAI API Error: ${err.error?.message || 'Failed to fetch embedding'}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

async function main() {
  console.log('Starting embedding generation process...');
  
  const properties = await prisma.property.findMany({
    include: { embedding: true }
  });

  console.log(`Found ${properties.length} properties total.`);
  
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const property of properties) {
    if (property.embedding) {
      skipped++;
      continue;
    }

    try {
      const text = await generateEmbeddingText(property);
      const vector = await fetchOpenAIEmbedding(text);
      
      // Store using pgvector raw query since Prisma Unsupported type
      // cannot be simply mapped as a normal Prisma create model
      const pgVectorStr = `[${vector.join(',')}]`;
      
      await prisma.$executeRawUnsafe(
        `INSERT INTO "PropertyEmbedding" ("id", "propertyId", "embedding") VALUES (gen_random_uuid(), $1, $2::vector)`,
        property.id,
        pgVectorStr
      );
      
      processed++;
      console.log(`[${processed}/${properties.length}] Generated embedding for: ${property.title}`);
    } catch (e) {
      failed++;
      console.error(`Error generating embedding for property ${property.id}:`, e);
    }
    
    // Add small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('---');
  console.log('Embedding generation complete!');
  console.log(`Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
