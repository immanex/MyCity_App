import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Successfully enabled pgvector extension!');
  } catch (error) {
    console.error('Error enabling pgvector:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
