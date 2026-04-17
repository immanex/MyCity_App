'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LocationAutocomplete({ value, onChange, onLocationSelect }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3 && query !== value) {
        setIsLoading(true);
        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          if (!token) return;
          
          // Search within Nigeria (country=ng)
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ng&types=neighborhood,locality,place,poi&access_token=${token}`);
          const data = await res.json();
          setSuggestions(data.features || []);
          setShowDropdown(true);
        } catch (error) {
          console.error('Geocoding failed:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, value]);

  const handleSelect = (feature: any) => {
    const placeName = feature.text;
    setQuery(placeName);
    onChange(placeName);
    setShowDropdown(false);
    
    if (onLocationSelect && feature.center) {
      onLocationSelect(feature.center[1], feature.center[0]);
    }
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          const { latitude, longitude } = position.coords;
          setQuery('Current Location');
          onChange('Near me');
          if (onLocationSelect) {
            onLocationSelect(latitude, longitude);
          }
        },
        (error) => {
          setIsLoading(false);
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder="Area (e.g. Lekki Phase 1)"
          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCurrentLocation}
        className="mt-2 flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
      >
        <Navigation className="w-4 h-4" />
        Use my current location
      </button>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
          {suggestions.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">{feature.text}</p>
                {feature.place_name && feature.place_name !== feature.text && (
                  <p className="text-xs text-slate-500 truncate">{feature.place_name}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
