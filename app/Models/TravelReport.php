<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelReport extends Model
{
    protected $fillable = [
        'title',
        'report_id',
        'background',
        'purpose_and_objectives',
        'scope',
        'legal_basis',
        'activities_conducted',
        'achievements',
        'conclusions',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
