import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const properties = await prisma.property.findMany({
      where: { featured: true },
      include: {
        images: { where: { isCover: true }, take: 1 }
      },
      orderBy: [
        { featuredIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Update featuredIndex for each property
    const updates = orderedIds.map((id, index) => 
      prisma.property.update({
        where: { id },
        data: { featuredIndex: index }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating featured order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
