<?php

namespace App\Enums;

enum ReviewerType: string
{
    case COMMITMENT_OFFICER = 'commitment_officer';
    case SECTION_HEAD = 'section_head';

    public function getLabel(): string
    {
        return match ($this) {
            self::COMMITMENT_OFFICER => 'Pejabat Pembuat Komitmen',
            self::SECTION_HEAD => 'Kepala Seksi',
        };
    }

    public static function getOptions(): array
    {
        return collect(self::cases())->mapWithKeys(fn($type) => [
            $type->value => $type->getLabel(),
        ])->toArray();
    }
}
