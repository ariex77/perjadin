import { useState } from 'react';

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
}

export const useGeolocation = () => {
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const getCurrentLocation = (): Promise<LocationData> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung oleh browser ini'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // Get address from coordinates using reverse geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=id`
                        );
                        const data = await response.json();
                        
                        const address = data.display_name || `${latitude}, ${longitude}`;
                        const locationData = { latitude, longitude, address };
                        setCurrentLocation(locationData);
                        setLocationError(null);
                        resolve(locationData);
                    } catch (error) {
                        // Fallback to coordinates if geocoding fails
                        const locationData = { 
                            latitude, 
                            longitude, 
                            address: `${latitude}, ${longitude}` 
                        };
                        setCurrentLocation(locationData);
                        setLocationError(null);
                        resolve(locationData);
                    }
                },
                (error) => {
                    let errorMessage = 'Tidak dapat mendapatkan lokasi';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Izin lokasi ditolak';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informasi lokasi tidak tersedia';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Timeout mendapatkan lokasi';
                            break;
                    }
                    setLocationError(errorMessage);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    };

    const clearLocation = () => {
        setCurrentLocation(null);
        setLocationError(null);
    };

    return {
        currentLocation,
        locationError,
        getCurrentLocation,
        clearLocation
    };
};
