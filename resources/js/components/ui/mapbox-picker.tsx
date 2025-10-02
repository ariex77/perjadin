import * as React from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as turf from '@turf/turf';
import { Progress } from '@/components/ui/progress';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

type MapboxPickerValue = {
    latitude: number;
    longitude: number;
    radius_m: number;
    address?: string;
};

interface MapboxPickerProps {
    defaultCenter?: [number, number]; // [lng, lat]
    defaultRadius?: number; // meters
    onChange?: (value: MapboxPickerValue) => void;
    className?: string;
    readOnly?: boolean; // untuk mode view only
}

export function MapboxPicker({ defaultCenter = [106.816666, -6.2], defaultRadius = 1000, onChange, className, readOnly = false }: MapboxPickerProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const markerRef = React.useRef<mapboxgl.Marker | null>(null);
    const [center, setCenter] = React.useState<[number, number] | null>(null);
    const [radius, setRadius] = React.useState<number>(defaultRadius);
    const [address, setAddress] = React.useState<string | undefined>(undefined);

    // Validasi koordinat default
    const isValidCoordinate = (coord: [number, number]) => {
        return coord && 
               Array.isArray(coord) && 
               coord.length === 2 && 
               typeof coord[0] === 'number' && 
               typeof coord[1] === 'number' && 
               !isNaN(coord[0]) && 
               !isNaN(coord[1]) &&
               coord[0] >= -180 && coord[0] <= 180 &&
               coord[1] >= -90 && coord[1] <= 90;
    };

    const safeDefaultCenter = isValidCoordinate(defaultCenter) ? defaultCenter : [106.816666, -6.2];

    // Update radius when defaultRadius changes (for edit mode)
    React.useEffect(() => {
        setRadius(defaultRadius);
    }, [defaultRadius]);

    React.useEffect(() => {
        // Gunakan token dummy untuk testing
        const token = (import.meta as any).env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';
        
        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
            container: containerRef.current as HTMLDivElement,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: safeDefaultCenter,
            zoom: 12,
            language: 'id', // Set bahasa Indonesia
        });
        mapRef.current = map;

        // Buat geocoder dengan konfigurasi yang lebih sederhana (hanya jika tidak read-only)
        let geocoder: any = null;
        if (!readOnly) {
            geocoder = new MapboxGeocoder({
                accessToken: token,
                mapboxgl: mapboxgl,
                marker: false,
                placeholder: 'Cari tempat / alamat…',
                countries: 'id',
                language: 'id',
                types: 'poi,address,place',
            });
            
            // Tambahkan geocoder ke peta
            map.addControl(geocoder, 'top-left');
            
            // Handle geocoder result
            geocoder.on('result', (e: any) => {
                const placeName = e.result?.place_name || e.result?.text || '';
                setAddress(placeName || undefined);
                const centerCoords: [number, number] = [e.result.center[0], e.result.center[1]];
                setCenter(centerCoords);
                
                const map = mapRef.current;
                if (map) {
                    if (!markerRef.current) {
                        const m = new mapboxgl.Marker({ draggable: !readOnly }).setLngLat(centerCoords).addTo(map);
                        m.on('dragend', () => {
                            const p = m.getLngLat();
                            setCenter([p.lng, p.lat]);
                        });
                        markerRef.current = m;
                    } else {
                        markerRef.current.setLngLat(centerCoords);
                    }
                    map.flyTo({ center: centerCoords, zoom: 16 });
                }
                
                onChange?.({ 
                    latitude: e.result.center[1], 
                    longitude: e.result.center[0], 
                    radius_m: radius, 
                    address: placeName || undefined
                });
            });
        }

        // Initialize marker with default center for edit mode
        if (safeDefaultCenter && !markerRef.current) {
            const m = new mapboxgl.Marker({ draggable: !readOnly }).setLngLat(safeDefaultCenter as [number, number]).addTo(map);
            if (!readOnly) {
                m.on('dragend', () => {
                    const p = m.getLngLat();
                    setCenter([p.lng, p.lat]);
                });
            }
            markerRef.current = m;
            setCenter(defaultCenter);
        }

        // Hanya tambahkan click event jika tidak read-only
        if (!readOnly) {
            map.on('click', (e) => {
                const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                setCenter(lngLat);
                if (!markerRef.current) {
                    const m = new mapboxgl.Marker({ draggable: true }).setLngLat(lngLat as [number, number]).addTo(map);
                    m.on('dragend', () => {
                        const p = m.getLngLat();
                        setCenter([p.lng, p.lat]);
                    });
                    markerRef.current = m;
                } else {
                    markerRef.current.setLngLat(lngLat as [number, number]);
                }
                map.flyTo({ center: lngLat, zoom: 16 });
            });
        }

        return () => {
            map.remove();
        };
    }, []);

    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !center) return;

        // Wait for map style to load before adding sources
        if (!map.isStyleLoaded()) {
            const handleStyleLoad = () => {
                addCircleToMap();
            };
            map.on('style.load', handleStyleLoad);
            return () => {
                map.off('style.load', handleStyleLoad);
            };
        }

        addCircleToMap();
    }, [center, radius, address]);

    const addCircleToMap = () => {
        const map = mapRef.current;
        if (!map || !center) return;

        const circle = turf.circle(center, radius / 1000, { steps: 64, units: 'kilometers' });
        const sourceId = 'radius-circle';
        const fillId = 'radius-fill';
        const lineId = 'radius-line';

        if (map.getSource(sourceId)) {
            (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(circle as any);
        } else {
            map.addSource(sourceId, { type: 'geojson', data: circle as any });
            map.addLayer({ id: fillId, type: 'fill', source: sourceId, paint: { 'fill-opacity': 0.15, 'fill-color': '#3b82f6' } });
            map.addLayer({ id: lineId, type: 'line', source: sourceId, paint: { 'line-width': 2, 'line-color': '#3b82f6' } });
        }

        onChange?.({ latitude: center[1], longitude: center[0], radius_m: radius, address });
    };





    const progressValue = ((radius - 500) / 4500) * 100;

    return (
        <div className={className}>
            <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-xl" />
            <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Radius: {radius >= 1000 ? `${radius/1000} km` : `${radius} m`}</span>
                    <span className="text-xs text-muted-foreground">{progressValue.toFixed(0)}%</span>
                </div>
                <div className="relative">
                    <Progress 
                        value={progressValue} 
                        className="w-full"
                    />
                    {!readOnly && (
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={progressValue}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                const newRadius = Math.round((value / 100) * 4500) + 500;
                                setRadius(newRadius);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {[500, 1000, 2000, 3000, 4000, 5000].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => !readOnly && setRadius(r)}
                            disabled={readOnly}
                            className={`rounded-md border px-2 py-1 text-sm transition-colors ${
                                readOnly 
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                                    : 'hover:bg-accent cursor-pointer'
                            } ${radius === r ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                            {r >= 1000 ? `${r/1000} km` : `${r} m`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


