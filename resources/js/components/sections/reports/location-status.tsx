import { MapPin } from 'lucide-react';

interface LocationStatusProps {
    locationError: string | null;
    currentLocation: {
        latitude: number;
        longitude: number;
        address: string;
    } | null;
    isGettingLocation: boolean;
}

export function LocationStatus({ locationError, currentLocation, isGettingLocation }: LocationStatusProps) {
    if (locationError) {
        return (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 text-sm">{locationError}</p>
                <p className="text-destructive text-xs mt-1">
                    Dokumentasi tetap dapat dibuat tanpa lokasi
                </p>
            </div>
        );
    }

    if (currentLocation) {
        return (
            <div className="bg-green-300/10 p-4 rounded-lg border border-green-500">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 text-sm font-medium">
                        Lokasi Terdeteksi
                    </span>
                </div>
                <p className="text-green-600 text-xs mt-1">
                    {currentLocation.address}
                </p>
            </div>
        );
    }

    if (isGettingLocation) {
        return (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 text-sm">
                    Mendapatkan lokasi...
                </p>
            </div>
        );
    }

    return null;
}
