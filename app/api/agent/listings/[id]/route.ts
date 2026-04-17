import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const agentId = user.id;

    // Verify ownership
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing || existing.agentId !== agentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        city: data.city,
        area: data.area,
        fullAddress: data.fullAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        priceDisplay: data.priceDisplay,
        priceNumeric: data.priceNumeric,
        beds: data.beds,
        baths: data.baths,
        toilets: data.toilets,
        sqm: data.sqm,
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status
      }
    });

    // Update images if provided
    if (data.images) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      await prisma.propertyImage.createMany({
        data: data.images.map((img: any) => ({
          propertyId: id,
          imageUrl: img.imageUrl,
          isCover: img.isCover || false
        }))
      });
    }

    // Update amenities if provided
    if (data.amenityIds) {
      await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
      await prisma.propertyAmenity.createMany({
        data: data.amenityIds.map((amenityId: string) => ({
          propertyId: id,
          amenityId
        }))
      });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const agentId = user.id;

    // Verify ownership
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing || existing.agentId !== agentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
