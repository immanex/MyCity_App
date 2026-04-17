import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = user.id;

    // Verify agent role
    const dbUser = await prisma.user.findUnique({ where: { id: agentId } });
    if (!dbUser || (dbUser.role !== 'AGENT' && dbUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalListings, totalViews, totalLeads] = await Promise.all([
      prisma.property.count({ where: { agentId } }),
      prisma.userEvent.count({
        where: {
          eventType: 'VIEW_PROPERTY',
          property: { agentId }
        }
      }),
      prisma.inquiry.count({
        where: {
          property: { agentId }
        }
      })
    ]);

    // Views per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentViews = await prisma.userEvent.findMany({
      where: {
        eventType: 'VIEW_PROPERTY',
        property: { agentId },
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    });

    const viewsPerDayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      viewsPerDayMap.set(dateStr, 0);
    }

    recentViews.forEach(view => {
      const dateStr = view.createdAt.toISOString().split('T')[0];
      if (viewsPerDayMap.has(dateStr)) {
        viewsPerDayMap.set(dateStr, viewsPerDayMap.get(dateStr)! + 1);
      }
    });

    const viewsPerDay = Array.from(viewsPerDayMap.entries()).map(([date, views]) => ({
      date,
      views
    }));

    return NextResponse.json({
      totalListings,
      totalViews,
      totalLeads,
      viewsPerDay
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
  }
}
