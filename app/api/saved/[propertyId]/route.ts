import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.savedProperty.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedProperty.create({
        data: {
          userId: user.id,
          propertyId,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Error toggling saved property:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
