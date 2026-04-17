import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let url = process.env.SUPABASE_DB_URL;
  
  // Robust check for missing or placeholder URL
  const isInvalid = !url || 
                    url.trim() === '' || 
                    url.includes('[YOUR-PASSWORD]') || 
                    url.includes('YOUR-PASSWORD');

  if (isInvalid) {
    console.warn('SUPABASE_DB_URL is missing or invalid. Using dummy URL to prevent crash.');
    // Use a valid-formatted dummy URL so Prisma doesn't throw a validation error on init
    url = 'postgresql://postgres:password@localhost:5432/postgres';
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
