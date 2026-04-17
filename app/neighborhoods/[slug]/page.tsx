import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';

import NeighborhoodMap from '@/components/map/NeighborhoodMap';

export default async function NeighborhoodDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const searchName = decodeURIComponent(slug).replace(/-/g, ' ');

  const neighborhood = await prisma.neighborhood.findFirst({
    where: {
      areaName: {
        equals: searchName,
        mode: 'insensitive'
      }
    }
  });

  if (!neighborhood) {
    notFound();
  }

  const properties = await prisma.property.findMany({
    where: {
      area: {
        equals: neighborhood.areaName,
        mode: 'insensitive'
      },
      city: neighborhood.city,
      status: 'AVAILABLE'
    },
    include: {
      images: {
        where: { isCover: true },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  // Static POIs for MVP
  const pois = [
    'Shopping Malls & Retail Centers',
    'Top-rated Restaurants & Cafes',
    'International Schools',
    'Parks & Recreation',
    'Healthcare Facilities'
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-slate-50">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-emerald-900 text-white py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
          </div>
          <div className="container mx-auto relative z-10 max-w-4xl space-y-6">
            <div className="flex flex-wrap gap-2">
              {neighborhood.lifestyleTags?.map((tag: string) => (
                <span key={tag} className="text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold">{neighborhood.areaName}</h1>
            <div className="flex items-center gap-2 text-emerald-200 text-xl">
              <MapPin className="w-5 h-5" />
              {neighborhood.city}
            </div>
            <p className="text-xl md:text-2xl text-emerald-50 max-w-2xl leading-relaxed">
              {neighborhood.description}
            </p>
            <div className="pt-8">
              <p className="text-sm text-emerald-300 uppercase tracking-widest font-bold mb-1">Average Property Price</p>
              <p className="text-4xl font-bold">₦{(neighborhood.avgPrice! / 1000000).toFixed(0)}M</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 space-y-20">
          {/* Map Preview */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-6">Location Overview</h2>
            {neighborhood.centerLat && neighborhood.centerLng ? (
              <NeighborhoodMap 
                latitude={neighborhood.centerLat} 
                longitude={neighborhood.centerLng} 
                properties={properties}
                polygonGeoJson={neighborhood.polygonGeoJson}
              />
            ) : (
              <div className="w-full aspect-video bg-slate-200 rounded-3xl flex items-center justify-center text-slate-500 border border-slate-200">
                Map preview not available
              </div>
            )}
          </section>

          {/* Properties */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold">Properties in {neighborhood.areaName}</h2>
              <Link href={`/explore?area=${encodeURIComponent(neighborhood.areaName)}`} className="text-emerald-700 font-bold flex items-center gap-1 hover:gap-2 transition-all group">
                View all <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500">No properties currently available in this area.</p>
              </div>
            )}
          </section>

          {/* POIs */}
          <section className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-serif font-bold mb-8">What's Nearby</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pois.map((poi, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {i + 1}
                  </div>
                  <span className="font-medium text-slate-700">{poi}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomTab />
    </div>
  );
}
