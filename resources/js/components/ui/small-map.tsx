import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Eye } from 'lucide-react';

interface SmallMapProps {
    latitude: number;
    longitude: number;
    address?: string;
    title?: string;
    className?: string;
    showToggle?: boolean;
    onToggle?: () => void;
}

export default function SmallMap({
    latitude,
    longitude,
    address,
    title = "Lokasi",
    className = "",
}: SmallMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {

        // Load Mapbox GL JS
        const loadMapbox = async () => {
            if (typeof window !== 'undefined' && !window.mapboxgl) {
                const mapboxgl = await import('mapbox-gl');
                window.mapboxgl = mapboxgl.default;
            }

            if (window.mapboxgl && mapRef.current && !mapInstanceRef.current) {
                window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

                mapInstanceRef.current = new window.mapboxgl.Map({
                    container: mapRef.current,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [longitude, latitude],
                    zoom: 15,
                    interactive: false, // Disable interactions for small map
                    language: 'id', // Set bahasa Indonesia
                });

                // Add marker
                new window.mapboxgl.Marker()
                    .setLngLat([longitude, latitude])
                    .addTo(mapInstanceRef.current);
            }
        };

        loadMapbox();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude]);

    return (
        <div className={`${className}`}>
            <div className={`${className}`}>
                <div
                    ref={mapRef}
                    className="w-full h-48 rounded-md border border-gray-200"
                />

                {address && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {address}
                    </p>
                )}

                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Lat: {latitude.toFixed(6)}</span>
                    <span>Lng: {longitude.toFixed(6)}</span>
                </div>
            </div>
        </div>

    );
}

// Add mapboxgl to window type
declare global {
    interface Window {
        mapboxgl: any;
    }
}
