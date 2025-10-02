<?php

namespace App\Observers;

use App\Models\ReportReview;
use App\Services\ReportStatusService;

class ReportReviewObserver
{
    /**
     * Handle the ReportReview "created" event.
     */
    public function created(ReportReview $reportReview): void
    {
        // Update status report ketika review dibuat
        ReportStatusService::updateReportStatus($reportReview->report);
    }

    /**
     * Handle the ReportReview "updated" event.
     */
    public function updated(ReportReview $reportReview): void
    {
        // Update status report ketika review diupdate
        ReportStatusService::updateReportStatus($reportReview->report);
    }

    /**
     * Handle the ReportReview "deleted" event.
     */
    public function deleted(ReportReview $reportReview): void
    {
        // Update status report ketika review dihapus
        ReportStatusService::updateReportStatus($reportReview->report);
    }
}
