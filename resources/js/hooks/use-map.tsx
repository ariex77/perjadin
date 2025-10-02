import { useState, useCallback } from 'react';

interface MapLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

interface UseMapProps {
    initialLocation?: MapLocation;
    showMap?: boolean;
}

export function useMap({ initialLocation, showMap = true }: UseMapProps = {}) {
    const [location, setLocation] = useState<MapLocation | null>(initialLocation || null);
    const [isMapVisible, setIsMapVisible] = useState(showMap);

    const updateLocation = useCallback((newLocation: MapLocation) => {
        setLocation(newLocation);
    }, []);

    const toggleMap = useCallback(() => {
        setIsMapVisible(prev => !prev);
    }, []);

    return {
        location,
        isMapVisible,
        updateLocation,
        toggleMap,
        setLocation,
        setIsMapVisible,
    };
}
