import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PropertyType, ListingType, Status } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const city = searchParams.get('city');
  const area = searchParams.get('area');
  const listingType = searchParams.get('listingType') as ListingType | null;
  const propertyType = searchParams.get('propertyType') as PropertyType | null;
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
  const beds = searchParams.get('beds') ? parseInt(searchParams.get('beds')!) : undefined;
  const baths = searchParams.get('baths') ? parseInt(searchParams.get('baths')!) : undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const sort = searchParams.get('sort') || 'newest';

  const skip = (page - 1) * limit;

  const where: any = {
    status: Status.AVAILABLE,
  };

  if (city) where.city = city;
  if (area) where.area = { contains: area, mode: 'insensitive' };
  if (listingType) where.listingType = listingType;
  if (propertyType) where.propertyType = propertyType;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceNumeric = {};
    if (minPrice !== undefined) where.priceNumeric.gte = minPrice;
    if (maxPrice !== undefined) where.priceNumeric.lte = maxPrice;
  }
  if (beds !== undefined) where.beds = beds === 4 ? { gte: 4 } : beds;
  if (baths !== undefined) where.baths = baths;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { priceNumeric: 'asc' };
  if (sort === 'price_desc') orderBy = { priceNumeric: 'desc' };

  try {
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            where: { isCover: true },
            take: 1,
          },
          agent: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      total,
      page,
      hasMore: total > skip + limit,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
