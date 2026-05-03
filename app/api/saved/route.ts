import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            images: {
              where: { isCover: true },
              take: 1,
            },
            agent: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    return NextResponse.json(savedProperties.map(s => s.property));
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return NextResponse.json({ error: 'Failed to fetch saved properties' }, { status: 500 });
  }
}
