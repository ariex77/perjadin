<?php

namespace App\Enums;

enum TransportationType: string
{
    case AIR = 'air';
    case SEA = 'sea';
    case LAND = 'land';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::AIR => 'Udara',
            self::SEA => 'Laut',
            self::LAND => 'Darat',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::AIR => 'Transportasi menggunakan pesawat terbang',
            self::SEA => 'Transportasi menggunakan kapal laut',
            self::LAND => 'Transportasi menggunakan kendaraan darat',
        };
    }
}
