import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

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

async function fetchGeminiEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
    config: {
      outputDimensionality: 768
    }
  });

  if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
    throw new Error('Failed to generate embedding from Gemini API');
  }

  return response.embeddings[0].values;
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
      const vector = await fetchGeminiEmbedding(text);
      
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
