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

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.name || !data.filters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: data.name,
        filters: data.filters,
        emailNotifications: data.emailNotifications || false
      }
    });

    return NextResponse.json(savedSearch);
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 });
  }
}
