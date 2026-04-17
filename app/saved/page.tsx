'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';
import PropertyCard from '@/components/property/PropertyCard';
import PropertySkeleton from '@/components/property/PropertySkeleton';
import { Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch saved properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">Saved Properties</h1>
          <p className="text-slate-500 text-lg">Properties you've bookmarked for later.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => <PropertySkeleton key={i} />)}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Heart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-slate-900">No saved properties yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Start exploring and tap the heart icon on properties you like to save them here.
              </p>
            </div>
            <Button asChild className="btn-primary">
              <Link href="/explore">
                <Search className="mr-2 w-5 h-5" />
                Explore Properties
              </Link>
            </Button>
          </div>
        )}
      </main>

      <BottomTab />
    </div>
  );
}
