import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { polygon } = await request.json();

    if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
      return NextResponse.json({ error: 'Invalid polygon data' }, { status: 400 });
    }

    // Ensure polygon is closed (first and last points are the same)
    let closedPolygon = [...polygon];
    const firstPoint = closedPolygon[0];
    const lastPoint = closedPolygon[closedPolygon.length - 1];
    
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      closedPolygon.push(firstPoint);
    }

    // Format polygon for PostGIS ST_GeomFromGeoJSON
    const geoJsonPolygon = {
      type: 'Polygon',
      coordinates: [closedPolygon]
    };

    // Use raw query for PostGIS ST_Within
    // Property table needs a geometry column, but since we only have latitude/longitude,
    // we construct the point on the fly.
    // ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    
    // Note: We need to make sure the table name is correctly quoted if it's case sensitive in Postgres,
    // Prisma usually creates tables with double quotes like "Property".
    
    const properties = await prisma.$queryRaw`
      SELECT id, title, priceDisplay, "priceNumeric", beds, baths, area, city, "propertyType", "listingType", latitude, longitude
      FROM "Property"
      WHERE status = 'AVAILABLE' AND isVerified = true
      AND ST_Within(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
        ST_GeomFromGeoJSON(${JSON.stringify(geoJsonPolygon)})
      )
      LIMIT 100;
    `;

    // We also need to fetch cover images for these properties since raw query doesn't include relations easily
    const propertyIds = (properties as any[]).map(p => p.id);
    
    if (propertyIds.length === 0) {
      return NextResponse.json([]);
    }

    const images = await prisma.propertyImage.findMany({
      where: {
        propertyId: { in: propertyIds },
        isCover: true
      }
    });

    const propertiesWithImages = (properties as any[]).map(p => ({
      ...p,
      images: images.filter(img => img.propertyId === p.id)
    }));

    return NextResponse.json(propertiesWithImages);
  } catch (error) {
    console.error('Error fetching properties by polygon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
