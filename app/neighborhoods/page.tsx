export const dynamic = "force-dynamic";

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Map } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';

export default async function NeighborhoodsIndex() {
  const neighborhoods = await prisma.neighborhood.findMany();

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 space-y-12">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">City Discovery</h1>
          <p className="text-lg text-slate-600">Explore the most vibrant neighborhoods and find your perfect community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {neighborhoods.map((n, i) => (
            <Link
              key={n.id}
              href={`/neighborhoods/${encodeURIComponent(n.areaName.toLowerCase().replace(/ /g, '-'))}`}
              className={`relative h-80 rounded-[2.5rem] overflow-hidden p-10 flex flex-col justify-end group transition-all duration-700 hover:scale-[1.02] ${
                i % 3 === 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-800' :
                i % 3 === 1 ? 'bg-gradient-to-br from-blue-600 to-indigo-800' :
                'bg-gradient-to-br from-slate-800 to-slate-950'
              }`}
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                <Map className="w-48 h-48" />
              </div>
              <div className="relative space-y-3">
                <h3 className="text-white text-3xl font-serif font-bold">{n.areaName}</h3>
                <p className="text-white/80 font-medium">{n.city} • Avg. Price: ₦{(n.avgPrice! / 1000000).toFixed(0)}M</p>
                <div className="flex flex-wrap gap-2 pt-3">
                  {n.lifestyleTags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg bg-white/15 text-white backdrop-blur-md border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <BottomTab />
    </div>
  );
}
