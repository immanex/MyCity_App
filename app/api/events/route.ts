import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { eventType, propertyId, searchQuery } = body;

  // Fire and forget - don't await the DB write to respond quickly
  prisma.userEvent.create({
    data: {
      userId: user.id,
      eventType,
      propertyId,
      searchQuery,
    },
  }).catch(err => console.error('Failed to log event:', err));

  return NextResponse.json({ success: true });
}
