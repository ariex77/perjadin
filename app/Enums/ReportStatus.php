<?php

namespace App\Enums;

enum ReportStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case REJECTED = 'rejected';
    case APPROVED = 'approved';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::REJECTED => 'Rejected',
            self::APPROVED => 'Approved',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::REJECTED => 'red',
            self::APPROVED => 'green',
        };
    }
}
