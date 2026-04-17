import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension enabled successfully.');
  } catch (error) {
    console.error('Error enabling PostGIS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
