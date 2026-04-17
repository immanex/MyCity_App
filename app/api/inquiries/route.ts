import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ContactType } from '@prisma/client';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, message, contactType = ContactType.IN_APP } = body;

  if (!propertyId || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agentId: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        propertyId,
        agentId: property.agentId,
        message,
        contactType,
      },
    });

    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
