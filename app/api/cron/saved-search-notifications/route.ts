import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // In a real app, verify cron secret here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    console.log('Starting saved search notifications cron job...');

    // Find all saved searches that have email notifications enabled
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        emailNotifications: true
      },
      include: {
        user: true
      }
    });

    let emailsSent = 0;

    for (const search of savedSearches) {
      const filters = search.filters as any;
      const lastNotifiedAt = search.lastNotifiedAt || search.createdAt;

      // Build query based on filters to find NEW properties since lastNotifiedAt
      const whereClause: any = {
        status: 'AVAILABLE',
        isVerified: true,
        createdAt: {
          gt: lastNotifiedAt
        }
      };

      if (filters.listingType && filters.listingType !== 'ALL') {
        whereClause.listingType = filters.listingType;
      }
      if (filters.city) {
        whereClause.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.area) {
        whereClause.area = { contains: filters.area, mode: 'insensitive' };
      }
      if (filters.minPrice || filters.maxPrice) {
        whereClause.priceNumeric = {};
        if (filters.minPrice) whereClause.priceNumeric.gte = filters.minPrice;
        if (filters.maxPrice) whereClause.priceNumeric.lte = filters.maxPrice;
      }
      if (filters.beds) {
        if (filters.beds === '4+') {
          whereClause.beds = { gte: 4 };
        } else {
          whereClause.beds = parseInt(filters.beds);
        }
      }
      if (filters.propertyType && filters.propertyType.length > 0) {
        whereClause.propertyType = { in: filters.propertyType };
      }

      const newProperties = await prisma.property.findMany({
        where: whereClause,
        take: 5, // Limit to top 5 new properties for the email
        orderBy: { createdAt: 'desc' }
      });

      if (newProperties.length > 0) {
        // MVP: Placeholder for email sending
        console.log(`[EMAIL MOCK] Sending email to ${search.user.email}`);
        console.log(`Subject: New properties matching your search "${search.name}"`);
        console.log(`Found ${newProperties.length} new properties.`);
        
        emailsSent++;

        // Update lastNotifiedAt
        await prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastNotifiedAt: new Date() }
        });
      }
    }

    console.log(`Cron job completed. Sent ${emailsSent} emails.`);
    return NextResponse.json({ success: true, emailsSent });
  } catch (error) {
    console.error('Error in saved search notifications cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
