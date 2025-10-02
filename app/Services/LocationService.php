<?php

namespace App\Services;

class LocationService
{
    /**
     * Menghitung jarak antara dua titik koordinat menggunakan formula Haversine
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Mengecek apakah lokasi berada dalam radius yang ditentukan
     */
    public static function isWithinRadius(float $centerLat, float $centerLon, float $userLat, float $userLon, int $radiusMeters): bool
    {
        $distance = self::calculateDistance($centerLat, $centerLon, $userLat, $userLon);
        return $distance <= $radiusMeters;
    }

    /**
     * Mendapatkan jarak dalam meter antara lokasi user dan center
     */
    public static function getDistance(float $centerLat, float $centerLon, float $userLat, float $userLon): float
    {
        return self::calculateDistance($centerLat, $centerLon, $userLat, $userLon);
    }
}
