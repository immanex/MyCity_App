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

    const agents = await prisma.agentMetadata.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { fullName: true, email: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching pending agents:', error);
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
    const { action, agentId, userId } = data; // action: 'APPROVE', 'REJECT'

    if (action === 'APPROVE') {
      await prisma.$transaction([
        prisma.agentMetadata.update({
          where: { id: agentId },
          data: { isApproved: true }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { isVerified: true }
        })
      ]);
    } else if (action === 'REJECT') {
      // Delete user and metadata
      await prisma.user.delete({
        where: { id: userId }
      });
      // Supabase auth user deletion would be ideal here, but requires service role key.
      // For MVP, deleting from Prisma is sufficient to block access.
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        action: action === 'APPROVE' ? 'APPROVE_AGENT' : 'REJECT_AGENT',
        targetType: 'AgentMetadata',
        targetId: agentId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing agent action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
