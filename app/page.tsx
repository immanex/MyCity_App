'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';
import OnboardingModal from '@/components/home/OnboardingModal';
import HeroCarousel from '@/components/home/HeroCarousel';
import SearchBar from '@/components/explore/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PropertySkeleton from '@/components/property/PropertySkeleton';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp, Star, Map, History, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<any[]>([]);
  const [trendingProperties, setTrendingProperties] = useState<any[]>([]);
  const [premiumProperties, setPremiumProperties] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCity, setUserCity] = useState('Lagos');

  useEffect(() => {
    const city = localStorage.getItem('mycity_city') || 'Lagos';
    setUserCity(city);

    const fetchData = async () => {
      try {
        // Use AbortController to cancel requests on unmount
        const controller = new AbortController();
        
        const fetchOptions = { signal: controller.signal };

        const [featuredRes, recommendedRes, trendingRes, premiumRes, neighborhoodRes] = await Promise.all([
          fetch('/api/properties?limit=5&sort=newest', fetchOptions),
          fetch(`/api/properties/recommended?city=${city}`, fetchOptions),
          fetch(`/api/properties?city=${city}&limit=6&sort=newest`, fetchOptions),
          fetch('/api/properties?limit=8&sort=price_desc', fetchOptions),
          fetch('/api/neighborhoods', fetchOptions),
        ]);

        const [featured, recommended, trending, premium, neighborhoodData] = await Promise.all([
          featuredRes.json(),
          recommendedRes.json(),
          trendingRes.json(),
          premiumRes.json(),
          neighborhoodRes.json(),
        ]);

        setFeaturedProperties(featured.properties || []);
        setRecommendedProperties(recommended.properties || []);
        setTrendingProperties(trending.properties || []);
        setPremiumProperties(premium.properties || []);
        setNeighborhoods(Array.isArray(neighborhoodData) ? neighborhoodData : []);

        // Fetch recently viewed (non-blocking)
        const recentIds = JSON.parse(localStorage.getItem('mycity_recently_viewed') || '[]');
        if (recentIds.length > 0) {
          // Fetch in background without blocking
          Promise.all(
            recentIds.slice(0, 5).map((id: string) => 
              fetch(`/api/properties/${id}`, fetchOptions).then(res => res.json()).catch(() => null)
            )
          ).then(recentData => {
            setRecentlyViewed(recentData.filter(p => p && !p.error));
          }).catch(() => {});
        }
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.error('Failed to fetch home data:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup: abort pending requests on unmount
    return () => {
      // Cleanup logic handled by AbortController in the effect
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('mycity_recently_viewed');
    setRecentlyViewed([]);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <OnboardingModal />

      <main className="container mx-auto px-4 pt-24 space-y-24">
        {/* Hero Section */}
        <section className="relative">
          {isLoading ? (
            <div className="w-full aspect-[4/5] md:aspect-[21/9] bg-slate-100 animate-pulse rounded-[2.5rem]" />
          ) : (
            <div className="relative">
              <HeroCarousel properties={featuredProperties} />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20 hidden md:block">
                <SearchBar />
              </div>
            </div>
          )}
        </section>

        {/* Mobile Search Bar */}
        <div className="md:hidden -mt-8 relative z-20">
          <SearchBar />
        </div>

        {/* Recommended Section (AI) */}
        {recommendedProperties.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-xs bg-indigo-50 w-fit px-3 py-1 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  Recommended for you
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold">Based on your activity</h2>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {recommendedProperties.map((property) => (
                <div key={property.id} className="min-w-[300px] md:min-w-[350px]">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-[0.2em] text-xs">
                <TrendingUp className="w-4 h-4" />
                Hot Listings
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold">Trending in {userCity}</h2>
            </div>
            <Link href="/explore" className="text-emerald-700 font-bold flex items-center gap-1 hover:gap-2 transition-all group">
              Explore all <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="min-w-[300px] md:min-w-[350px]">
                  <PropertySkeleton />
                </div>
              ))
            ) : (trendingProperties?.length || 0) > 0 ? (
              trendingProperties.map((property) => (
                <div key={property.id} className="min-w-[300px] md:min-w-[350px]">
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500">No trending properties in this city yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Premium Estates Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">
                <Star className="w-4 h-4" />
                Curated Luxury
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold">Premium Estates</h2>
            </div>
            <Link href="/explore" className="text-emerald-700 font-bold flex items-center gap-1 hover:gap-2 transition-all group">
              View all <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <PropertySkeleton key={i} />)
            ) : (premiumProperties?.length || 0) > 0 ? (
              premiumProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">No premium estates available at the moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Neighborhoods Section */}
        <section className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-xs">
              <Map className="w-4 h-4" />
              Local Insights
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold">Explore Neighborhoods</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {neighborhoods?.map((n, i) => (
              <Link
                key={n.id}
                href={`/explore?area=${encodeURIComponent(n.areaName)}`}
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
                  <p className="text-white/80 font-medium">Avg. Price: ₦{(n.avgPrice / 1000000).toFixed(0)}M</p>
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
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold">Recently Viewed</h2>
              </div>
              <button onClick={clearHistory} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                Clear history
              </button>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {recentlyViewed.map((property) => (
                <div key={property.id} className="min-w-[300px] md:min-w-[350px]">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Partner Banner */}
        <section className="pb-16">
          <div className="relative rounded-3xl bg-emerald-700 p-8 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
            </div>
            <div className="relative max-w-2xl space-y-6">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                Become a MyCity Partner
              </h2>
              <p className="text-emerald-50 text-lg md:text-xl">
                List your property on Nigeria's most premium discovery platform and reach thousands of verified buyers and renters.
              </p>
              <Button asChild className="h-14 px-8 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg group">
                <Link href="/agent/register">
                  List Your Property
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <BottomTab />
    </div>
  );
}
