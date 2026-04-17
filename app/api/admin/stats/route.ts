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

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalUsers,
      totalProperties,
      pendingProperties,
      pendingAgents,
      pendingReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { isVerified: false } }),
      prisma.agentMetadata.count({ where: { isApproved: false } }),
      prisma.propertyReport.count({ where: { status: 'PENDING' } })
    ]);

    // Simple charts: new users per week, new properties per week (last 4 weeks)
    // For MVP, we'll just do a simple aggregation or return mock data if complex
    // Let's do a simple group by date for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const recentProperties = await prisma.property.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const chartDataMap = new Map<string, { date: string, users: number, properties: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartDataMap.set(dateStr, { date: dateStr, users: 0, properties: 0 });
    }

    recentUsers.forEach(u => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      if (chartDataMap.has(dateStr)) {
        chartDataMap.get(dateStr)!.users++;
      }
    });

    recentProperties.forEach(p => {
      const dateStr = p.createdAt.toISOString().split('T')[0];
      if (chartDataMap.has(dateStr)) {
        chartDataMap.get(dateStr)!.properties++;
      }
    });

    return NextResponse.json({
      totalUsers,
      totalProperties,
      pendingProperties,
      pendingAgents,
      pendingReports,
      chartData: Array.from(chartDataMap.values())
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
