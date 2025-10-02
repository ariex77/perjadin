<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutCityReport extends Model
{
    protected $guarded = [];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function fullboardPrice(): BelongsTo
    {
        return $this->belongsTo(FullboardPrice::class);
    }
}
