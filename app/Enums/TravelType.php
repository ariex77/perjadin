<?php

namespace App\Enums;

enum TravelType: string
{
    case IN_CITY = 'in_city';
    case OUT_CITY = 'out_city';
    case OUT_COUNTRY = 'out_country';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::IN_CITY => 'Dalam Kota',
            self::OUT_CITY => 'Luar Kota',
            self::OUT_COUNTRY => 'Luar Negeri',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::IN_CITY => 'Perjalanan dinas dalam wilayah kota yang sama',
            self::OUT_CITY => 'Perjalanan dinas ke luar kota atau wilayah berbeda',
            self::OUT_COUNTRY => 'Perjalanan dinas ke luar negeri',
        };
    }
}
