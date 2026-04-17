import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const { action, propertyIds } = data; // action: 'VERIFY', 'FEATURE', 'DELETE'

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: 'No properties selected' }, { status: 400 });
    }

    if (action === 'VERIFY') {
      await prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: { isVerified: true }
      });
    } else if (action === 'FEATURE') {
      await prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: { featured: true }
      });
    } else if (action === 'DELETE') {
      await prisma.property.deleteMany({
        where: { id: { in: propertyIds } }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Audit log
    await prisma.adminAction.createMany({
      data: propertyIds.map(id => ({
        adminId: user.id,
        action: action,
        targetType: 'Property',
        targetId: id
      }))
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
