<?php

namespace App\Enums;

enum ReviewStatus: string
{
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function getLabel(): string
    {
        return match ($this) {
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
        };
    }

    public static function getOptions(): array
    {
        return collect(self::cases())->mapWithKeys(fn($status) => [
            $status->value => $status->getLabel(),
        ])->toArray();
    }
}
