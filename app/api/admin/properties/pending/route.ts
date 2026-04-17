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
      where: { isVerified: false },
      include: {
        agent: { select: { fullName: true, email: true } },
        images: { where: { isCover: true }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching pending properties:', error);
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

    const { action, ids } = await request.json();

    if (action === 'VERIFY') {
      await prisma.property.updateMany({
        where: { id: { in: ids } },
        data: { isVerified: true }
      });
      
      // Audit log
      await Promise.all(ids.map(id => 
        prisma.adminAction.create({
          data: {
            adminId: user.id,
            action: 'VERIFY_PROPERTY',
            targetType: 'Property',
            targetId: id
          }
        })
      ));
    } else if (action === 'DELETE') {
      await prisma.property.deleteMany({
        where: { id: { in: ids } }
      });

      // Audit log
      await Promise.all(ids.map(id => 
        prisma.adminAction.create({
          data: {
            adminId: user.id,
            action: 'DELETE_PROPERTY',
            targetType: 'Property',
            targetId: id
          }
        })
      ));
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing property action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
