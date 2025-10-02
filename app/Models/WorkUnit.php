<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkUnit extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'head_id',
    ];

    /**
     * Get the users for this work unit.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the head (leader) of the work unit.
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_id');
    }
}
