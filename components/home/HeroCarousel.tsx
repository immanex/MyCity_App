'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroCarouselProps {
  properties: any[];
}

export default function HeroCarousel({ properties }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(interval);
    };
  }, [emblaApi, onSelect]);

  if (!properties || properties.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-slate-200 animate-pulse rounded-3xl" />
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-3xl shadow-2xl" ref={emblaRef}>
        <div className="flex">
          {properties.map((property, index) => (
            <div key={property.id} className="relative flex-[0_0_100%] min-w-0 aspect-[4/5] md:aspect-[21/9]">
              <Image
                src={property.images?.find((img: any) => img.isCover)?.imageUrl || property.images?.[0]?.imageUrl}
                alt={property.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 text-white space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm">
                  <MapPin className="w-4 h-4" />
                  {property.area}, {property.city}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-6xl font-serif font-bold leading-tight max-w-3xl drop-shadow-sm">
                    {property.title}
                  </h2>
                  <p className="text-xl md:text-3xl font-serif text-emerald-50 font-medium">
                    {property.priceDisplay}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Button asChild className="btn-primary">
                    <Link href={`/properties/${property.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {properties.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              selectedIndex === index ? 'w-8 bg-emerald-500' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
