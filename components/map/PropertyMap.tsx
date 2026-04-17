'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Coffee, GraduationCap, Hospital } from 'lucide-react';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  const [pois, setPois] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);

  useEffect(() => {
    // Fetch POIs using Mapbox Geocoding API
    const fetchPOIs = async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      try {
        const types = ['cafe', 'school', 'hospital'];
        const results = await Promise.all(types.map(async (type) => {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${type}.json?proximity=${longitude},${latitude}&limit=2&access_token=${token}`);
          const data = await res.json();
          return data.features.map((f: any) => ({ ...f, poiType: type }));
        }));
        
        setPois(results.flat());
      } catch (error) {
        console.error('Error fetching POIs:', error);
      }
    };

    fetchPOIs();
  }, [latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-500 border border-slate-200">
        Location not available
      </div>
    );
  }

  const getPoiIcon = (type: string) => {
    switch (type) {
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'school': return <GraduationCap className="w-4 h-4" />;
      case 'hospital': return <Hospital className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
  };

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 relative">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude,
          latitude,
          zoom: 14
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="bottom-right" />
        
        {/* Property Marker */}
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-white">
            <MapPin className="w-5 h-5" />
          </div>
        </Marker>

        {/* POI Markers */}
        {pois.map((poi) => (
          <Marker 
            key={poi.id} 
            longitude={poi.center[0]} 
            latitude={poi.center[1]} 
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedPoi(poi);
            }}
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200 text-slate-600 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              {getPoiIcon(poi.poiType)}
            </div>
          </Marker>
        ))}

        {/* POI Popup */}
        {selectedPoi && (
          <Popup
            longitude={selectedPoi.center[0]}
            latitude={selectedPoi.center[1]}
            anchor="top"
            onClose={() => setSelectedPoi(null)}
            closeOnClick={false}
            className="rounded-xl overflow-hidden"
          >
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-bold text-slate-900">{selectedPoi.text}</h4>
                <span className="text-[10px] font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {calculateDistance(latitude, longitude, selectedPoi.center[1], selectedPoi.center[0])}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{selectedPoi.properties?.address || selectedPoi.place_name}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
