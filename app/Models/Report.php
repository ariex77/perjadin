<?php

namespace App\Models;

use App\Enums\ReviewerType;
use App\Enums\TravelType;
use App\Enums\ReportStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'assignment_id',
        'travel_type',
        'status',
        // Informasi Surat Tugas
        'travel_order_number',
        'destination_city',
        'departure_date',
        'return_date',
        'actual_duration',
        'travel_purpose',
        'travel_order_file',
        'spd_file',
    ];

    protected $casts = [
        'travel_type' => TravelType::class,
        'status' => ReportStatus::class,
        'departure_date' => 'date',
        'return_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ReportReview::class);
    }

    public function inCityReport(): HasOne
    {
        return $this->hasOne(InCityReport::class);
    }

    public function outCityReport(): HasOne
    {
        return $this->hasOne(OutCityReport::class);
    }

    public function outCountyReport(): HasOne
    {
        return $this->hasOne(OutCountyReport::class);
    }

    public function travelReport(): HasOne
    {
        return $this->hasOne(TravelReport::class);
    }

    /**
     * Get commitment officer review
     */
    public function commitmentReview(): BelongsTo
    {
        return $this->hasOne(ReportReview::class)->where('reviewer_type', ReviewerType::COMMITMENT_OFFICER);
    }

    /**
     * Get section head review
     */
    public function sectionReview(): BelongsTo
    {
        return $this->hasOne(ReportReview::class)->where('reviewer_type', ReviewerType::SECTION_HEAD);
    }

    /**
     * Get the transportation types for this report.
     */
    public function transportationTypes(): BelongsToMany
    {
        return $this->belongsToMany(TransportationType::class, 'report_transportation_types');
    }

    /**
     * Tentukan apakah laporan ini mengalami perubahan setelah ditolak,
     * berdasarkan updated_at pada report atau relasi-relasi kunci.
     */
    public function hasChangesAfter(
        ?\DateTimeInterface $timestamp
    ): bool {
        if ($timestamp === null) {
            return false;
        }

        // Cek updated_at langsung pada report
        if ($this->updated_at && $this->updated_at->gt($timestamp)) {
            return true;
        }

        // Pastikan relasi yang dibutuhkan sudah ter-load untuk menghindari N+1
        $this->loadMissing([
            'inCityReport',
            'outCityReport',
            'outCountyReport',
            'travelReport',
            'assignment.assignmentDocumentations',
        ]);

        $relations = [
            $this->inCityReport,
            $this->outCityReport,
            $this->outCountyReport,
            $this->travelReport,
        ];

        foreach ($relations as $rel) {
            if ($rel && $rel->updated_at && $rel->updated_at->gt($timestamp)) {
                return true;
            }
        }

        // Dokumentasi penugasan
        if ($this->assignment) {
            foreach ($this->assignment->assignmentDocumentations ?? [] as $doc) {
                if ($doc->updated_at && $doc->updated_at->gt($timestamp)) {
                    return true;
                }
            }
        }

        return false;
    }
}
