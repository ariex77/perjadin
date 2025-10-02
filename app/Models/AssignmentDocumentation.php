<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentDocumentation extends Model
{
    protected $fillable = [
        'assignment_id',
        'photo',
        'address',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the assignment that owns the documentation.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }
}
