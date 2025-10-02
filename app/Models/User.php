<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'nip',
        'number_phone',
        'level',
        'gender',
        'password',
        'work_unit_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the work unit that owns the user.
     */
    public function workUnit()
    {
        return $this->belongsTo(WorkUnit::class);
    }

    /**
     * Get the address for the user.
     */
    public function address()
    {
        return $this->hasOne(Address::class);
    }

    public function assignments(): BelongsToMany
    {
        return $this->belongsToMany(Assignment::class, 'assignment_employees');
    }

    public function assignmentEmployees(): HasMany
    {
        return $this->hasMany(AssignmentEmployee::class);
    }

    /**
     * Get the reports for the user.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
