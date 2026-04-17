'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Map, Marker, NavigationControl, Popup, useControl } from 'react-map-gl/mapbox';
import useSupercluster from 'use-supercluster';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import { MapPin, Pencil, Search as SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DrawControl(props: any) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }: { map: any }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
    },
    ({ map }: { map: any }) => {
      map.off('draw.create', props.onCreate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );
  return null;
}

interface ExploreMapProps {
  properties: any[];
  onPolygonSearch?: (polygon: any) => void;
  clearPolygonSearch?: () => void;
  isPolygonSearchActive?: boolean;
}

export default function ExploreMap({ properties, onPolygonSearch, clearPolygonSearch, isPolygonSearchActive }: ExploreMapProps) {
  const mapRef = useRef<any>(null);
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(12);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState<any>({});

  const onUpdate = useCallback((e: any) => {
    setDrawnFeatures((currFeatures: any) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback((e: any) => {
    setDrawnFeatures((currFeatures: any) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);

  const handleSearchWithinArea = () => {
    const features = Object.values(drawnFeatures);
    if (features.length > 0 && onPolygonSearch) {
      // Pass the first drawn polygon
      onPolygonSearch((features[0] as any).geometry.coordinates[0]);
    }
  };

  const handleClearDrawing = () => {
    setDrawnFeatures({});
    setIsDrawingMode(false);
    if (clearPolygonSearch) clearPolygonSearch();
  };

  // Default to Lagos coordinates if no properties
  const defaultLat = 6.45;
  const defaultLng = 3.4;

  const initialLat = properties.length > 0 ? properties[0].latitude : defaultLat;
  const initialLng = properties.length > 0 ? properties[0].longitude : defaultLng;

  const points = useMemo(() => {
    return properties.map(p => ({
      type: 'Feature',
      properties: { cluster: false, propertyId: p.id, ...p },
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude]
      }
    }));
  }, [properties]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });

  return (
    <div className="w-full h-[calc(100vh-200px)] rounded-3xl overflow-hidden border border-slate-200 relative">
      {/* Drawing Tools Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {!isDrawingMode && !isPolygonSearchActive ? (
          <Button 
            onClick={() => setIsDrawingMode(true)}
            className="bg-white text-slate-700 hover:bg-slate-50 shadow-md border border-slate-200 rounded-xl gap-2"
          >
            <Pencil className="w-4 h-4" /> Draw Area
          </Button>
        ) : (
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 flex flex-col gap-3 w-64">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                {isPolygonSearchActive ? 'Area Search Active' : 'Draw an area'}
              </span>
              <button onClick={handleClearDrawing} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {!isPolygonSearchActive && (
              <>
                <p className="text-xs text-slate-500">Click on the map to draw a shape. Double click to finish.</p>
                <Button 
                  onClick={handleSearchWithinArea}
                  disabled={Object.keys(drawnFeatures).length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <SearchIcon className="w-4 h-4" /> Search Here
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: initialLng,
          latitude: initialLat,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={evt => {
          setZoom(evt.viewState.zoom);
          if (mapRef.current) {
            const bounds = mapRef.current.getMap().getBounds();
            setBounds([
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ]);
          }
        }}
        onLoad={() => {
          if (mapRef.current) {
            const bounds = mapRef.current.getMap().getBounds();
            setBounds([
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ]);
          }
        }}
      >
        <NavigationControl position="bottom-right" />

        {isDrawingMode && (
          <DrawControl
            position="top-right"
            displayControlsDefault={false}
            controls={{
              polygon: true,
              trash: true
            }}
            defaultMode="draw_polygon"
            onCreate={onUpdate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-md cursor-pointer"
                  style={{
                    width: `${10 + (pointCount / points.length) * 20}px`,
                    height: `${10 + (pointCount / points.length) * 20}px`
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 500
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={`property-${cluster.properties.propertyId}`}
              latitude={latitude}
              longitude={longitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedProperty(cluster.properties);
              }}
            >
              <div className="bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 text-sm font-bold text-slate-900 cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-colors flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {cluster.properties.priceDisplay}
              </div>
            </Marker>
          );
        })}

        {selectedProperty && (
          <Popup
            longitude={selectedProperty.longitude}
            latitude={selectedProperty.latitude}
            anchor="bottom"
            offset={24}
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
              <p className="text-xs text-slate-500">{selectedProperty.beds} Beds • {selectedProperty.baths} Baths</p>
              <p className="text-emerald-700 font-bold text-sm mt-1">{selectedProperty.priceDisplay}</p>
              <Link href={`/properties/${selectedProperty.propertyId}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                View details
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
