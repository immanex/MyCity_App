'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: any;
  showSaveButton?: boolean;
  onRemove?: (id: string) => void;
}

export default function PropertyCard({ property, showSaveButton = true, onRemove }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // In a real app, we'd check if this property is in the user's saved list
    // For Phase 2, we'll assume it's not saved initially unless passed from a "Saved" page
  }, [property.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }

    // Optimistic UI
    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const res = await fetch(`/api/saved/${property.id}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setIsSaved(data.saved);
        if (!data.saved && onRemove) {
          onRemove(property.id);
        }
        toast.success(data.saved ? 'Property saved' : 'Property removed');
        
        // Log event
        fetch('/api/events', {
          method: 'POST',
          body: JSON.stringify({ eventType: 'SAVE', propertyId: property.id }),
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setIsSaved(previousState);
      toast.error('Failed to update saved status');
    }
  };

  const handleCardClick = () => {
    // Log view event
    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ eventType: 'VIEW_PROPERTY', propertyId: property.id }),
    });

    // Store in recently viewed
    const recentlyViewed = JSON.parse(localStorage.getItem('mycity_recently_viewed') || '[]');
    const updated = [property.id, ...recentlyViewed.filter((id: string) => id !== property.id)].slice(0, 10);
    localStorage.setItem('mycity_recently_viewed', JSON.stringify(updated));
  };

  const coverImage = property.images?.find((img: any) => img.isCover)?.imageUrl || property.images?.[0]?.imageUrl || 'https://picsum.photos/seed/property/800/600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="card-premium group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/properties/${property.id}`} onClick={handleCardClick}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={`${coverImage}?width=400`}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {property.featured && (
              <div className="bg-amber-400 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                Featured
              </div>
            )}
            {property.isVerified && (
              <div className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                Verified
              </div>
            )}
          </div>

          {showSaveButton && (
            <button
              onClick={toggleSave}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white shadow-sm z-10"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'
                }`}
              />
            </button>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <div className="glass rounded-xl p-3 flex items-center justify-between">
              <p className="text-slate-900 font-serif text-lg font-bold leading-tight">
                {property.priceDisplay}
              </p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                {property.listingType}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-slate-900 font-serif text-xl font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="line-clamp-1 font-medium">{property.area}, {property.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-slate-600">
              {property.beds && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">{property.beds}</span>
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">{property.baths}</span>
                </div>
              )}
              {property.sqm && (
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">{property.sqm}m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
