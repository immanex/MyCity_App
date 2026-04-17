import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default params (fallback)
    const defaultCity = request.nextUrl.searchParams.get('city') || 'Lagos';
    
    let preferences: any = null;
    if (user) {
      preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id }
      });
    }

    // Build query based on preferences if available
    let conditions: any = { status: 'AVAILABLE' };

    if (preferences) {
      if (preferences.preferredCities && preferences.preferredCities.length > 0) {
        conditions.city = { in: preferences.preferredCities };
      }
      if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
        conditions.propertyType = { in: preferences.propertyTypes };
      }
      if (preferences.maxPrice) {
        conditions.priceNumeric = { lte: preferences.maxPrice };
      }
      if (preferences.minBeds) {
        conditions.beds = { gte: preferences.minBeds };
      }
    } else {
      conditions.city = defaultCity;
    }

    const properties = await prisma.property.findMany({
      where: conditions,
      include: {
        images: true,
        agent: true
      },
      take: 6,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = properties.map(p => ({
      ...p,
      priceDisplay: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p.priceNumeric)
    }));

    return NextResponse.json({ properties: formatted });
  } catch (error) {
    console.error('Error fetching recommended properties:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
