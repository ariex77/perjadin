<?php

namespace App\Models;

use App\Enums\ReviewerType;
use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportReview extends Model
{
    protected $fillable = [
        'report_id',
        'reviewer_id',
        'reviewer_type',
        'status',
        'notes',
    ];

    protected $casts = [
        'reviewer_type' => ReviewerType::class,
        'status' => ReviewStatus::class,
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Scope untuk commitment officer review
     */
    public function scopeCommitmentOfficer($query)
    {
        return $query->where('reviewer_type', ReviewerType::COMMITMENT_OFFICER);
    }

    /**
     * Scope untuk section head review
     */
    public function scopeSectionHead($query)
    {
        return $query->where('reviewer_type', ReviewerType::SECTION_HEAD);
    }

    /**
     * Scope untuk approved reviews
     */
    public function scopeApproved($query)
    {
        return $query->where('status', ReviewStatus::APPROVED);
    }

    /**
     * Scope untuk rejected reviews
     */
    public function scopeRejected($query)
    {
        return $query->where('status', ReviewStatus::REJECTED);
    }
}
