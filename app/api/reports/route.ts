import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, reason, description } = await request.json();

    if (!propertyId || !reason) {
      return NextResponse.json({ error: 'Property ID and reason are required' }, { status: 400 });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Create report
    const report = await prisma.propertyReport.create({
      data: {
        propertyId,
        userId: user.id,
        reason,
        description,
        status: 'PENDING'
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
