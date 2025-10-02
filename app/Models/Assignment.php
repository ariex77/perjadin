<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'assignment_employees');
    }

    // app/Models/Assignment.php
    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


    public function assignmentEmployees(): HasMany
    {
        return $this->hasMany(AssignmentEmployee::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function assignmentDocumentations(): HasMany
    {
        return $this->hasMany(AssignmentDocumentation::class);
    }
}
