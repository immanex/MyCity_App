import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json(preferences || {});
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        preferredCities: data.preferredCities,
        preferredAreas: data.preferredAreas,
        maxPrice: data.maxPrice,
        minBeds: data.minBeds,
        propertyTypes: data.propertyTypes,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        preferredCities: data.preferredCities || [],
        preferredAreas: data.preferredAreas || [],
        maxPrice: data.maxPrice,
        minBeds: data.minBeds,
        propertyTypes: data.propertyTypes || []
      }
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
