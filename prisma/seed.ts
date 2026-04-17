import { PrismaClient, Role, PropertyType, ListingType, Status, ContactType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Amenities
  const amenitiesData = [
    'Pool', 'Security', 'Gym', 'Power', 'Parking', 'Elevator'
  ];

  const amenities = await Promise.all(
    amenitiesData.map(name => 
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  // 2. Agents
  const agents = await Promise.all([
    prisma.user.upsert({
      where: { email: 'emeka.nwachukwu@mycity.com' },
      update: {},
      create: {
        id: 'agent-1-id', // In real app, this would be Supabase UID
        email: 'emeka.nwachukwu@mycity.com',
        fullName: 'Emeka Nwachukwu',
        phoneNumber: '+2348012345678',
        role: Role.AGENT,
        isVerified: true,
        agentMetadata: {
          create: {
            agencyName: 'Nwachukwu & Co. Real Estate',
            licenseNumber: 'RE-12345',
            yearsExperience: 10,
            bio: 'Specializing in luxury properties in Ikoyi and Victoria Island.'
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'funke.adeyemi@mycity.com' },
      update: {},
      create: {
        id: 'agent-2-id',
        email: 'funke.adeyemi@mycity.com',
        fullName: 'Funke Adeyemi',
        phoneNumber: '+2348098765432',
        role: Role.AGENT,
        isVerified: true,
        agentMetadata: {
          create: {
            agencyName: 'Adeyemi Homes',
            licenseNumber: 'RE-67890',
            yearsExperience: 7,
            bio: 'Expert in Lekki residential properties and investment opportunities.'
          }
        }
      }
    })
  ]);

  // 3. Neighborhoods
  const neighborhoods = await Promise.all([
    prisma.neighborhood.create({
      data: {
        city: 'Lagos',
        areaName: 'Lekki Phase 1',
        description: 'A vibrant residential and commercial hub with excellent amenities.',
        avgPrice: 85000000,
        lifestyleTags: ['Vibrant', 'Upscale', 'Family-friendly'],
        centerLat: 6.4478,
        centerLng: 3.4723
      }
    }),
    prisma.neighborhood.create({
      data: {
        city: 'Lagos',
        areaName: 'Victoria Island',
        description: 'The business heart of Lagos, featuring luxury apartments and high-end dining.',
        avgPrice: 150000000,
        lifestyleTags: ['Business', 'Luxury', 'Nightlife'],
        centerLat: 6.4281,
        centerLng: 3.4215
      }
    }),
    prisma.neighborhood.create({
      data: {
        city: 'Lagos',
        areaName: 'Ikoyi',
        description: 'The most prestigious neighborhood in Lagos, known for its colonial charm and modern luxury.',
        avgPrice: 250000000,
        lifestyleTags: ['Prestigious', 'Quiet', 'Elite'],
        centerLat: 6.4549,
        centerLng: 3.4308
      }
    })
  ]);

  // 4. Properties
  const propertyData = [
    {
      title: 'Luxury 4 Bedroom Terrace',
      description: 'Modern terrace house with premium finishes in the heart of Lekki.',
      city: 'Lagos',
      area: 'Lekki Phase 1',
      fullAddress: 'Plot 12, Admiralty Way, Lekki Phase 1',
      latitude: 6.4485,
      longitude: 3.4735,
      priceDisplay: '₦120,000,000',
      priceNumeric: 120000000,
      beds: 4,
      baths: 4,
      toilets: 5,
      sqm: 350,
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.BUY,
      agentId: agents[1].id,
      featured: true
    },
    {
      title: 'Ocean View Penthouse',
      description: 'Stunning penthouse with panoramic views of the Atlantic Ocean.',
      city: 'Lagos',
      area: 'Victoria Island',
      fullAddress: 'Eko Atlantic City, Victoria Island',
      latitude: 6.4220,
      longitude: 3.4150,
      priceDisplay: '₦450,000,000',
      priceNumeric: 450000000,
      beds: 3,
      baths: 3,
      toilets: 4,
      sqm: 500,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.BUY,
      agentId: agents[0].id,
      featured: true
    },
    {
      title: 'Cozy 2 Bedroom Flat',
      description: 'Perfect for young professionals, located near major business hubs.',
      city: 'Lagos',
      area: 'Victoria Island',
      fullAddress: 'Akin Adesola Street, Victoria Island',
      latitude: 6.4310,
      longitude: 3.4250,
      priceDisplay: '₦5,000,000/year',
      priceNumeric: 5000000,
      beds: 2,
      baths: 2,
      toilets: 3,
      sqm: 120,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      agentId: agents[0].id
    },
    {
      title: 'Spacious 5 Bedroom Detached House',
      description: 'Large family home with a private pool and garden.',
      city: 'Lagos',
      area: 'Ikoyi',
      fullAddress: 'Banana Island, Ikoyi',
      latitude: 6.4650,
      longitude: 3.4500,
      priceDisplay: '₦850,000,000',
      priceNumeric: 850000000,
      beds: 5,
      baths: 5,
      toilets: 6,
      sqm: 800,
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.BUY,
      agentId: agents[0].id,
      featured: true
    },
    {
      title: 'Modern 3 Bedroom Apartment',
      description: 'Fully serviced apartment with 24/7 power and security.',
      city: 'Lagos',
      area: 'Lekki Phase 1',
      fullAddress: 'Freedom Way, Lekki Phase 1',
      latitude: 6.4550,
      longitude: 3.4850,
      priceDisplay: '₦85,000,000',
      priceNumeric: 850000000,
      beds: 3,
      baths: 3,
      toilets: 4,
      sqm: 220,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.BUY,
      agentId: agents[1].id
    },
    {
      title: 'Shortlet Studio Apartment',
      description: 'Stylish studio for short stays, fully furnished.',
      city: 'Lagos',
      area: 'Victoria Island',
      fullAddress: 'Oniru, Victoria Island',
      latitude: 6.4350,
      longitude: 3.4450,
      priceDisplay: '₦65,000/night',
      priceNumeric: 65000,
      beds: 1,
      baths: 1,
      toilets: 1,
      sqm: 45,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.SHORTLET,
      agentId: agents[0].id
    },
    {
      title: 'Prime Commercial Land',
      description: 'Excellent location for office development or retail.',
      city: 'Lagos',
      area: 'Lekki Phase 1',
      fullAddress: 'Lekki-Epe Expressway, Lekki Phase 1',
      latitude: 6.4450,
      longitude: 3.4650,
      priceDisplay: '₦250,000,000',
      priceNumeric: 250000000,
      sqm: 1000,
      propertyType: PropertyType.LAND,
      listingType: ListingType.BUY,
      agentId: agents[1].id
    },
    {
      title: 'Luxury 4 Bedroom Maisonette',
      description: 'Spacious maisonette with high ceilings and modern kitchen.',
      city: 'Lagos',
      area: 'Ikoyi',
      fullAddress: 'Bourdillon Road, Ikoyi',
      latitude: 6.4520,
      longitude: 3.4350,
      priceDisplay: '₦350,000,000',
      priceNumeric: 350000000,
      beds: 4,
      baths: 4,
      toilets: 5,
      sqm: 400,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.BUY,
      agentId: agents[0].id
    },
    {
      title: 'Serviced 3 Bedroom Flat',
      description: 'Well-maintained flat in a secure gated community.',
      city: 'Lagos',
      area: 'Lekki Phase 1',
      fullAddress: 'Chevron Drive, Lekki',
      latitude: 6.4380,
      longitude: 3.5250,
      priceDisplay: '₦3,500,000/year',
      priceNumeric: 3500000,
      beds: 3,
      baths: 3,
      toilets: 4,
      sqm: 180,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      agentId: agents[1].id
    },
    {
      title: 'Commercial Office Space',
      description: 'Open plan office space in a prime business district.',
      city: 'Lagos',
      area: 'Victoria Island',
      fullAddress: 'Adeola Odeku Street, Victoria Island',
      latitude: 6.4290,
      longitude: 3.4220,
      priceDisplay: '₦15,000,000/year',
      priceNumeric: 15000000,
      sqm: 250,
      propertyType: PropertyType.COMMERCIAL,
      listingType: ListingType.RENT,
      agentId: agents[0].id
    }
  ];

  for (const p of propertyData) {
    const property = await prisma.property.create({
      data: {
        ...p,
        images: {
          create: [
            { imageUrl: `https://picsum.photos/seed/${p.title.replace(/\s/g, '')}1/800/600`, isCover: true },
            { imageUrl: `https://picsum.photos/seed/${p.title.replace(/\s/g, '')}2/800/600` },
            { imageUrl: `https://picsum.photos/seed/${p.title.replace(/\s/g, '')}3/800/600` }
          ]
        },
        amenities: {
          create: amenities.slice(0, 3).map(a => ({
            amenityId: a.id
          }))
        }
      }
    });
    console.log(`Created property: ${property.title}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
