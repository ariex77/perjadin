<?php

namespace App\Services;

use App\Enums\ReviewerType;
use App\Enums\ReviewStatus;
use App\Models\User;
use App\Models\WorkUnit;
use App\Models\Report;
use App\Models\ReportReview;

class ReportReviewerService
{
    /**
     * Set reviewer otomatis berdasarkan work_unit user
     */
    public function setAutoReviewers(Report $report): void
    {
        $user = $report->user;
        
        // Set Pejabat Pembuat Komitmen (1 orang tetap)
        $commitmentOfficer = $this->getCommitmentOfficer();
        if ($commitmentOfficer) {
            ReportReview::create([
                'report_id' => $report->id,
                'reviewer_id' => $commitmentOfficer->id,
                'reviewer_type' => ReviewerType::COMMITMENT_OFFICER,
                'status' => ReviewStatus::APPROVED, // Default ke approved, bisa diubah nanti
            ]);
        }
        
        // Set Ketua Seksi berdasarkan work_unit user
        $sectionHead = $this->getSectionHeadByWorkUnit($user->work_unit_id);
        if ($sectionHead) {
            ReportReview::create([
                'report_id' => $report->id,
                'reviewer_id' => $sectionHead->id,
                'reviewer_type' => ReviewerType::SECTION_HEAD,
                'status' => ReviewStatus::APPROVED, // Default ke approved, bisa diubah nanti
            ]);
        }
    }
    
    /**
     * Ambil Pejabat Pembuat Komitmen (1 orang tetap)
     */
    public function getCommitmentOfficer(): ?User
    {
        // Bisa disesuaikan dengan logic bisnis
        // Misalnya user dengan role 'commitment_officer' atau level tertentu
        return User::where('level', 'commitment_officer')
                  ->orWhere('username', 'commitment_officer')
                  ->first();
    }
    
    /**
     * Ambil Ketua Seksi berdasarkan work_unit_id
     */
    public function getSectionHeadByWorkUnit(?int $workUnitId): ?User
    {
        if (!$workUnitId) {
            return null;
        }
        
        $workUnit = WorkUnit::find($workUnitId);
        if (!$workUnit) {
            return null;
        }
        
        // Ambil ketua seksi berdasarkan work_unit
        // Bisa disesuaikan dengan logic bisnis
        return User::where('work_unit_id', $workUnitId)
                  ->where('level', 'section_head')
                  ->orWhere('username', 'section_head_' . $workUnit->code)
                  ->first();
    }
    
    /**
     * Update status review berdasarkan approval
     */
    public function updateReviewStatus(Report $report, string $reviewerType, bool $isApproved, ?string $notes = null): void
    {
        $review = $report->reviews()
                        ->where('reviewer_type', $reviewerType)
                        ->first();
        
        if ($review) {
            $review->update([
                'status' => $isApproved ? ReviewStatus::APPROVED : ReviewStatus::REJECTED,
                'notes' => $notes,
    
            ]);
            
            // Status laporan sekarang dihitung berdasarkan kombinasi review
            // Tidak perlu update kolom status di tabel reports
        }
    }
    
    /**
     * Cek apakah user bisa review laporan tertentu
     */
    public function canReviewReport(User $user, Report $report, string $reviewerType): bool
    {
        return $report->reviews()
                     ->where('reviewer_id', $user->id)
                     ->where('reviewer_type', $reviewerType)
                     ->exists();
    }
    
    /**
     * Get reviews untuk user tertentu
     */
    public function getUserReviews(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return ReportReview::where('reviewer_id', $user->id)
                          ->with(['report.user'])
                          ->get();
    }
}
