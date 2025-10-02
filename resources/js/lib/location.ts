/**
 * Fungsi untuk menghitung jarak antara dua koordinat menggunakan formula Haversine
 * @param lat1 Latitude koordinat pertama
 * @param lon1 Longitude koordinat pertama
 * @param lat2 Latitude koordinat kedua
 * @param lon2 Longitude koordinat kedua
 * @returns Jarak dalam meter
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
}

/**
 * Interface untuk hasil validasi lokasi
 */
export interface LocationValidation {
    distance: number;
    isWithinRadius: boolean;
    message: string;
}

/**
 * Interface untuk data tiket
 */
export interface TicketLocation {
    latitude: number;
    longitude: number;
    radius_m: number | null;
}

/**
 * Fungsi untuk validasi apakah lokasi berada dalam radius tiket
 * @param userLatitude Latitude lokasi user
 * @param userLongitude Longitude lokasi user
 * @param ticket Data tiket yang berisi koordinat dan radius
 * @returns Hasil validasi lokasi atau null jika data tidak lengkap
 */
export function validateLocationRadius(
    userLatitude: number, 
    userLongitude: number, 
    ticket: TicketLocation
): LocationValidation | null {
    if (!ticket.latitude || !ticket.longitude || !ticket.radius_m) {
        return null;
    }

    const distance = calculateDistance(
        userLatitude, userLongitude,
        ticket.latitude, ticket.longitude
    );

    const isWithinRadius = distance <= ticket.radius_m;
    const message = isWithinRadius 
        ? `Lokasi dalam radius (${distance.toFixed(0)}m dari ${ticket.radius_m}m)`
        : `Lokasi di luar radius (${distance.toFixed(0)}m dari ${ticket.radius_m}m)`;

    return { distance, isWithinRadius, message };
}

/**
 * Fungsi untuk mendapatkan alamat dari koordinat menggunakan reverse geocoding
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Promise yang resolve ke alamat atau null jika gagal
 */
export async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=id`
        );
        const data = await response.json();

        return data.display_name || null;
    } catch (error) {
        console.warn('Gagal mendapatkan alamat otomatis:', error);
        return null;
    }
}

/**
 * Fungsi untuk mendapatkan lokasi user menggunakan Geolocation API
 * @param options Opsi untuk geolocation
 * @returns Promise yang resolve ke koordinat atau reject dengan error
 */
export function getCurrentUserLocation(options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
}): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser ini.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                let errorMessage = 'Gagal mendapatkan lokasi.';

                switch (error.code) {
                    case 1:
                        errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
                        break;
                    case 2:
                        errorMessage = 'Lokasi tidak tersedia.';
                        break;
                    case 3:
                        errorMessage = 'Timeout saat mendapatkan lokasi.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }

                reject(new Error(errorMessage));
            },
            options
        );
    });
}
