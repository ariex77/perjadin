<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InCityReport extends Model
{
    protected $fillable = [
        'report_id',
        'daily_allowance',
        'transportation_cost',
        'vehicle_rental_fee',
        'actual_expense',
        'transportation_receipt',
        'vehicle_rental_receipt',
    ];

    protected $casts = [
        'daily_allowance' => 'decimal:2',
        'transportation_cost' => 'decimal:2',
        'vehicle_rental_fee' => 'decimal:2',
        'actual_expense' => 'decimal:2',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
