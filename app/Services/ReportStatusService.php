<?php

namespace App\Services;

use App\Models\Report;
use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;

class ReportStatusService
{
    /**
     * Update report status berdasarkan reviews
     */
    public static function updateReportStatus(Report $report): void
    {
        $reviews = $report->reviews;
        
        if ($reviews->isEmpty()) {
            // Jika belum ada reviews, status tetap draft
            $report->update(['status' => ReportStatus::DRAFT]);
            return;
        }
        
        // Cek apakah ada review yang rejected
        $hasRejected = $reviews->where('status', ReviewStatus::REJECTED)->count() > 0;
        
        if ($hasRejected) {
            // Jika ada yang rejected, status jadi rejected
            $report->update(['status' => ReportStatus::REJECTED]);
            return;
        }
        
        // Cek jumlah approved reviews
        $approvedCount = $reviews->where('status', ReviewStatus::APPROVED)->count();
        
        if ($approvedCount >= 2) {
            // Jika ada 2 approved, status jadi approved
            $report->update(['status' => ReportStatus::APPROVED]);
        } else {
            // Jika belum 2 approved, status jadi submitted
            $report->update(['status' => ReportStatus::SUBMITTED]);
        }
    }
    
    /**
     * Update status untuk semua reports
     */
    public static function updateAllReportStatuses(): void
    {
        $reports = Report::with('reviews')->get();
        
        foreach ($reports as $report) {
            self::updateReportStatus($report);
        }
    }
}
