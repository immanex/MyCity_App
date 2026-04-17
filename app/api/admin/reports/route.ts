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

    const reports = await prisma.propertyReport.findMany({
      where: { status: 'PENDING' },
      include: {
        property: { select: { title: true, id: true } },
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
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

    const data = await request.json();
    const { action, reportId, propertyId } = data; // action: 'DISMISS', 'REMOVE_PROPERTY'

    if (action === 'DISMISS') {
      await prisma.propertyReport.update({
        where: { id: reportId },
        data: { 
          status: 'DISMISSED',
          resolvedAt: new Date(),
          resolvedBy: user.id
        }
      });
    } else if (action === 'REMOVE_PROPERTY') {
      await prisma.property.delete({
        where: { id: propertyId }
      });
      // Cascade delete will remove the report, but just in case:
      await prisma.propertyReport.updateMany({
        where: { propertyId },
        data: {
          status: 'REVIEWED',
          resolvedAt: new Date(),
          resolvedBy: user.id
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
