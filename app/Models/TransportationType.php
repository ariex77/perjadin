<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TransportationType extends Model
{
    protected $fillable = [
        'name',
        'label',
        'description',
    ];

    /**
     * Get the reports that use this transportation type.
     */
    public function reports(): BelongsToMany
    {
        return $this->belongsToMany(Report::class, 'report_transportation_types');
    }
}
