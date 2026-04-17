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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { agentId },
        include: {
          images: {
            where: { isCover: true },
            take: 1
          },
          _count: {
            select: {
              inquiries: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.property.count({ where: { agentId } })
    ]);

    // Get views for these properties
    const propertyIds = properties.map(p => p.id);
    const views = await prisma.userEvent.groupBy({
      by: ['propertyId'],
      where: {
        eventType: 'VIEW_PROPERTY',
        propertyId: { in: propertyIds }
      },
      _count: {
        _all: true
      }
    });

    const viewsMap = new Map(views.map(v => [v.propertyId, v._count._all]));

    const formattedProperties = properties.map(p => ({
      ...p,
      views: viewsMap.get(p.id) || 0,
      leads: p._count.inquiries
    }));

    return NextResponse.json({
      properties: formattedProperties,
      total,
      page,
      hasMore: total > skip + limit
    });
  } catch (error) {
    console.error('Error fetching agent listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = user.id;
    const data = await request.json();

    // Basic validation
    if (!data.title || !data.priceNumeric || !data.city || !data.area) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        agentId,
        title: data.title,
        description: data.description || '',
        city: data.city,
        area: data.area,
        fullAddress: data.fullAddress || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        priceDisplay: data.priceDisplay || `₦${data.priceNumeric.toLocaleString()}`,
        priceNumeric: data.priceNumeric,
        beds: data.beds,
        baths: data.baths,
        toilets: data.toilets,
        sqm: data.sqm,
        propertyType: data.propertyType || 'HOUSE',
        listingType: data.listingType || 'BUY',
        status: data.status || 'AVAILABLE',
        images: {
          create: data.images?.map((img: any) => ({
            imageUrl: img.imageUrl,
            isCover: img.isCover || false
          })) || []
        },
        amenities: {
          create: data.amenityIds?.map((id: string) => ({
            amenityId: id
          })) || []
        }
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
