'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, Popup, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import circle from '@turf/circle';
import Link from 'next/link';

interface NeighborhoodMapProps {
  latitude: number;
  longitude: number;
  properties: any[];
  polygonGeoJson?: any;
}

export default function NeighborhoodMap({ latitude, longitude, properties, polygonGeoJson }: NeighborhoodMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [showProperties, setShowProperties] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  useEffect(() => {
    if (polygonGeoJson) {
      setGeoJson(polygonGeoJson);
    } else if (latitude && longitude) {
      // Create a 1km circle if no polygon provided
      const options = { steps: 64, units: 'kilometers' as const };
      const c = circle([longitude, latitude], 1, options);
      setGeoJson(c);
    }
  }, [latitude, longitude, polygonGeoJson]);

  if (!latitude || !longitude) return null;

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-slate-200 relative">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude,
          latitude,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        <NavigationControl position="bottom-right" />

        {/* Layer Toggles */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setShowProperties(!showProperties)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md transition-all ${
              showProperties ? 'bg-emerald-600 text-white' : 'bg-white/80 text-slate-600'
            }`}
          >
            {showProperties ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Properties
          </button>
          <button 
            onClick={() => setShowBoundary(!showBoundary)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md transition-all ${
              showBoundary ? 'bg-emerald-600 text-white' : 'bg-white/80 text-slate-600'
            }`}
          >
            {showBoundary ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Boundary
          </button>
        </div>

        {/* Neighborhood Boundary */}
        {geoJson && showBoundary && (
          <Source id="neighborhood-boundary" type="geojson" data={geoJson}>
            <Layer
              id="boundary-fill"
              type="fill"
              paint={{
                'fill-color': '#059669',
                'fill-opacity': 0.1
              }}
            />
            <Layer
              id="boundary-line"
              type="line"
              paint={{
                'line-color': '#059669',
                'line-width': 2
              }}
            />
          </Source>
        )}

        {/* Property Markers */}
        {showProperties && properties.map((property) => (
          <Marker 
            key={property.id} 
            longitude={property.longitude} 
            latitude={property.latitude} 
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedProperty(property);
            }}
          >
            <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform" />
          </Marker>
        ))}

        {/* Property Popup */}
        {selectedProperty && showProperties && (
          <Popup
            longitude={selectedProperty.longitude}
            latitude={selectedProperty.latitude}
            anchor="bottom"
            offset={12}
            onClose={() => setSelectedProperty(null)}
            closeOnClick={false}
            className="rounded-xl overflow-hidden z-50"
          >
            <div className="p-1 w-48">
              {selectedProperty.images?.[0]?.imageUrl && (
                <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden mb-2">
                  <img src={selectedProperty.images[0].imageUrl} alt="cover" className="w-full h-full object-cover" />
                </div>
              )}
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{selectedProperty.title}</h4>
              <p className="text-emerald-700 font-bold text-sm">{selectedProperty.priceDisplay}</p>
              <Link href={`/properties/${selectedProperty.id}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                View details
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
