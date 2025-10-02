<?php

namespace Database\Seeders;

use App\Enums\ReviewerType;
use App\Enums\ReviewStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Report;
use App\Models\ReportReview;
use App\Models\User;
use App\Services\ReportStatusService;

class ReportReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil report yang sudah ada (kecuali yang milik Employee 1)
        $reports = Report::whereHas('user', function ($query) {
            $query->where('name', '!=', 'Employee 1');
        })->get();

        if ($reports->isEmpty()) {
            $this->command->info('Tidak ada report yang tersedia untuk membuat review.');
            return;
        }

        // Ambil verificator dan leader
        $verificator = User::where('name', 'Verifikator')->first();
        $leaders = User::where('name', 'like', 'Leader%')->get();

        if (!$verificator || $leaders->isEmpty()) {
            $this->command->info('Verifikator atau Leader tidak ditemukan.');
            return;
        }

        foreach ($reports as $index => $report) {
            // Verifikator review (PPK) - selalu ada
            ReportReview::create([
                'report_id' => $report->id,
                'reviewer_id' => $verificator->id,
                'reviewer_type' => ReviewerType::COMMITMENT_OFFICER,
                'status' => $index % 3 === 0 ? ReviewStatus::REJECTED : ReviewStatus::APPROVED, // 1/3 chance rejected
                'notes' => $index % 3 === 0 
                    ? 'Laporan ditolak. Mohon perbaiki beberapa bagian yang kurang lengkap.'
                    : 'Laporan disetujui. Semua dokumen lengkap dan sesuai prosedur.',
            ]);

            // Leader review (Kasi) - hanya jika verificator approve
            if ($index % 3 !== 0) { // Jika verificator approve
                $leader = $leaders->random();
                ReportReview::create([
                    'report_id' => $report->id,
                    'reviewer_id' => $leader->id,
                    'reviewer_type' => ReviewerType::SECTION_HEAD,
                    'status' => $index % 4 === 0 ? ReviewStatus::REJECTED : ReviewStatus::APPROVED, // 1/4 chance rejected
                    'notes' => $index % 4 === 0 
                        ? 'Laporan ditolak. Ada ketidaksesuaian dalam laporan perjalanan.'
                        : 'Laporan disetujui. Dokumen perjalanan dinas sudah memenuhi persyaratan administrasi.',
                ]);
            }
        }

        // Update status semua reports berdasarkan reviews
        ReportStatusService::updateAllReportStatuses();

        $this->command->info('ReportReview seeder berhasil dijalankan.');
    }
}
