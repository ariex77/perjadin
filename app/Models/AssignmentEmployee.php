<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentEmployee extends Model
{
    protected $table = 'assignment_employees';

    protected $guarded = ['id'];

    protected $fillable = [
        'assignment_id',
        'user_id',
    ];

    /**
     * Get the assignment that owns the assignment employee.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the user that owns the assignment employee.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
