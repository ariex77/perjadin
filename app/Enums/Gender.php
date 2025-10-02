<?php

namespace App\Enums;

enum Gender: string
{
    case MALE = 'Male';
    case FEMALE = 'Female';

    public function getLabel(): string
    {
        return match ($this) {
            self::MALE => 'Laki-laki',
            self::FEMALE => 'Perempuan',
        };
    }

    public static function getOptions(): array
    {
        return collect(self::cases())->mapWithKeys(fn($status) => [
            $status->value => $status->getLabel(),
        ])->toArray();
    }
}