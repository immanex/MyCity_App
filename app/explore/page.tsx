'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';
import SearchBar from '@/components/explore/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PropertySkeleton from '@/components/property/PropertySkeleton';
import { Button } from '@/components/ui/button';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  LayoutGrid, 
  List,
  Search as SearchIcon,
  Filter
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ExploreMap from '@/components/map/ExploreMap';
import LocationAutocomplete from '@/components/explore/LocationAutocomplete';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter states
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'ALL');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 1000000000);
  const [beds, setBeds] = useState(searchParams.get('beds') || '');
  const [propertyType, setPropertyType] = useState<string[]>(searchParams.get('propertyType')?.split(',') || []);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [polygon, setPolygon] = useState<any>(null);

  const fetchProperties = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page + 1 : 1;
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    if (polygon) {
      // Use polygon search API
      try {
        const res = await fetch('/api/properties/by-polygon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ polygon })
        });
        const data = await res.json();
        setProperties(data || []);
        setTotal(data?.length || 0);
        setHasMore(false); // Polygon search doesn't paginate for MVP
      } catch (error) {
        console.error('Failed to fetch properties by polygon:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
      return;
    }

    const params = new URLSearchParams();
    if (listingType !== 'ALL') params.append('listingType', listingType);
    if (city) params.append('city', city);
    if (area) params.append('area', area);
    if (minPrice > 0) params.append('minPrice', minPrice.toString());
    if (maxPrice < 1000000000) params.append('maxPrice', maxPrice.toString());
    if (beds) params.append('beds', beds);
    if (propertyType.length > 0) params.append('propertyType', propertyType.join(','));
    params.append('sort', sort);
    params.append('page', currentPage.toString());
    params.append('limit', '12');

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      
      if (isLoadMore) {
        setProperties(prev => [...prev, ...(data.properties || [])]);
      } else {
        setProperties(data.properties || []);
      }
      setTotal(data.total || 0);
      setPage(currentPage);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [listingType, city, area, minPrice, maxPrice, beds, propertyType, sort, page, polygon]);

  useEffect(() => {
    fetchProperties();
  }, [listingType, city, area, minPrice, maxPrice, beds, propertyType, sort, polygon]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 300 &&
        !isLoadingMore &&
        hasMore &&
        !isLoading
      ) {
        fetchProperties(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProperties, isLoadingMore, hasMore, isLoading]);

  const togglePropertyType = (type: string) => {
    setPropertyType(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setListingType('ALL');
    setCity('');
    setArea('');
    setMinPrice(0);
    setMaxPrice(1000000000);
    setBeds('');
    setPropertyType([]);
    setSort('newest');
  };

  const formatPrice = (val: number) => {
    if (val >= 1000000000) return '₦1B+';
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 space-y-8">
        {/* Search & Filter Header */}
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto w-full">
            <SearchBar />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-24 z-40 py-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              <Tabs value={listingType} onValueChange={setListingType} className="w-auto">
                <TabsList className="bg-white shadow-sm rounded-2xl h-12 p-1 border border-slate-100">
                  <TabsTrigger value="ALL" className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest">All</TabsTrigger>
                  <TabsTrigger value="BUY" className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest">Buy</TabsTrigger>
                  <TabsTrigger value="RENT" className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest">Rent</TabsTrigger>
                  <TabsTrigger value="SHORTLET" className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest">Shortlet</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-2xl bg-white shadow-sm border-slate-200 gap-2 px-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-50">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {(city || area || beds || propertyType.length > 0 || minPrice > 0 || maxPrice < 1000000000) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                  <SheetHeader className="p-6 border-b border-slate-100">
                    <SheetTitle className="text-2xl font-serif font-bold">Filters</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Location */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
                      <div className="space-y-3">
                        <Select value={city} onValueChange={(val) => setCity(val || '')}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lagos">Lagos</SelectItem>
                            <SelectItem value="Abuja">Abuja</SelectItem>
                            <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                          </SelectContent>
                        </Select>
                        <LocationAutocomplete 
                          value={area} 
                          onChange={(val) => setArea(val)} 
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</label>
                        <span className="text-sm font-medium text-emerald-700">
                          {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                        </span>
                      </div>
                      <div className="px-2 pt-4">
                        <Slider
                          value={[minPrice, maxPrice]}
                          min={0}
                          max={1000000000}
                          step={1000000}
                          onValueChange={(val) => {
                            if (Array.isArray(val)) {
                              const [min, max] = val;
                              setMinPrice(min);
                              setMaxPrice(max);
                            }
                          }}
                          className="text-emerald-700"
                        />
                      </div>
                    </div>

                    {/* Bedrooms */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bedrooms</label>
                      <div className="flex gap-2">
                        {['1', '2', '3', '4+'].map((val) => (
                          <button
                            key={val}
                            onClick={() => setBeds(beds === val ? '' : val)}
                            className={`flex-1 h-12 rounded-xl border transition-all font-medium ${
                              beds === val
                                ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Type</label>
                      <div className="flex flex-wrap gap-2">
                        {['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'].map((type) => (
                          <button
                            key={type}
                            onClick={() => togglePropertyType(type)}
                            className={`px-4 py-2 rounded-full border text-sm transition-all font-medium ${
                              propertyType.includes(type)
                                ? 'border-emerald-700 bg-emerald-700 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="p-6 border-t border-slate-100 bg-slate-50 flex flex-row gap-4">
                    <Button variant="ghost" onClick={clearFilters} className="flex-1 h-12 rounded-xl">
                      Clear All
                    </Button>
                    <SheetClose asChild>
                      <Button className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                        Apply Filters
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                    viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                    viewMode === 'map' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Map
                </button>
              </div>

              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest hidden lg:block">
                <span className="text-slate-900">{total}</span> properties found
              </p>
              
              <Button 
                variant="outline" 
                className="h-12 rounded-2xl bg-white shadow-sm border-emerald-200 text-emerald-700 gap-2 px-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-50"
                onClick={async () => {
                  const name = prompt('Enter a name for this search:');
                  if (!name) return;
                  
                  const wantsEmail = confirm('Would you like to receive email notifications when new properties match this search?');
                  
                  const filters = {
                    listingType: listingType !== 'ALL' ? listingType : undefined,
                    city: city || undefined,
                    area: area || undefined,
                    minPrice: minPrice > 0 ? minPrice : undefined,
                    maxPrice: maxPrice < 1000000000 ? maxPrice : undefined,
                    beds: beds || undefined,
                    propertyType: propertyType.length > 0 ? propertyType : undefined
                  };

                  try {
                    const res = await fetch('/api/saved-searches', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, filters, emailNotifications: wantsEmail })
                    });
                    if (res.ok) {
                      alert('Search saved successfully');
                    } else if (res.status === 401) {
                      router.push('/login?redirect=/explore');
                    } else {
                      alert('Failed to save search');
                    }
                  } catch (error) {
                    alert('Error saving search');
                  }
                }}
              >
                Save Search
              </Button>

              <Select value={sort} onValueChange={(val) => setSort(val || '')}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-white shadow-sm border-slate-200 text-xs font-bold uppercase tracking-widest">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="newest" className="text-xs font-bold uppercase tracking-widest">Newest First</SelectItem>
                  <SelectItem value="price_asc" className="text-xs font-bold uppercase tracking-widest">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc" className="text-xs font-bold uppercase tracking-widest">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Grid or Map */}
        <div className="space-y-8 relative">
          {viewMode === 'map' ? (
            <>
              <ExploreMap 
                properties={properties} 
                onPolygonSearch={(poly) => setPolygon(poly)}
                clearPolygonSearch={() => setPolygon(null)}
                isPolygonSearchActive={!!polygon}
              />
              
              {/* Floating Filter Button for Mobile Map */}
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="h-14 px-8 rounded-full bg-slate-900 border-none text-white shadow-2xl flex items-center gap-3 backdrop-blur-xl">
                      <Filter className="w-5 h-5" />
                      <span className="font-bold uppercase tracking-widest text-xs">Filter Results</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem] p-0 flex flex-col">
                    <SheetHeader className="p-8 border-b border-slate-100 flex-shrink-0">
                      <SheetTitle className="text-3xl font-serif font-bold">Refine Map</SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-8 space-y-10">
                      {/* Duplicate filter UI logic or extract it to a component */}
                      {/* For now, just repeating essential filters for speed, 
                          ideally extract the SheetContent body to a FilterContent component */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</label>
                        <div className="px-2 pt-4">
                          <Slider
                            value={[minPrice, maxPrice]}
                            min={0}
                            max={1000000000}
                            step={1000000}
                            onValueChange={(val) => {
                              if (Array.isArray(val)) {
                                const [min, max] = val;
                                setMinPrice(min);
                                setMaxPrice(max);
                              }
                            }}
                            className="text-emerald-700"
                          />
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900">
                          <span>{formatPrice(minPrice)}</span>
                          <span>{formatPrice(maxPrice)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bedrooms</label>
                        <div className="flex gap-2">
                          {['1', '2', '3', '4+'].map((val) => (
                            <button
                              key={val}
                              onClick={() => setBeds(beds === val ? '' : val)}
                              className={`flex-1 h-14 rounded-2xl border-2 transition-all font-bold ${
                                beds === val
                                  ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-100 bg-white text-slate-600'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="p-8 border-t border-slate-100 bg-slate-50 flex flex-row gap-4 flex-shrink-0">
                      <SheetClose asChild>
                        <Button className="flex-1 h-16 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg">
                          Show {total} Properties
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => <PropertySkeleton key={i} />)
                ) : (properties?.length || 0) > 0 ? (
                  properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <SearchIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-bold text-slate-900">No properties match your filters</h3>
                      <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                    <Button onClick={clearFilters} variant="outline" className="rounded-xl border-emerald-700 text-emerald-700 hover:bg-emerald-50">
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Loading More State */}
              {isLoadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array(3).fill(0).map((_, i) => <PropertySkeleton key={i} />)}
                </div>
              )}

              {!hasMore && (properties?.length || 0) > 0 && (
                <div className="py-12 text-center text-slate-400 font-medium border-t border-slate-100">
                  You've reached the end of the results
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomTab />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
          <div className="h-12 w-full bg-slate-200 animate-pulse rounded-xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        </div>
        <BottomTab />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
