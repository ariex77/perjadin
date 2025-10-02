<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutCountyReport extends Model
{
    protected $table = 'out_country_reports';
    
    protected $guarded = [];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
