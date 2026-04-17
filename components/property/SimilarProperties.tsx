'use client';

import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { Sparkles } from 'lucide-react';

export default function SimilarProperties({ propertyId }: { propertyId: string }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await fetch(`/api/properties/${propertyId}/similar`);
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to fetch similar properties:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="space-y-6 pt-8 border-t border-slate-100">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="aspect-[4/3] bg-slate-100 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <div className="space-y-8 pt-8 border-t border-slate-100">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Similar Properties</h2>
        <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Recommended
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
