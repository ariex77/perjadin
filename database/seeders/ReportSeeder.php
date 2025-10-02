<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Report;
use App\Models\Assignment;
use App\Models\AssignmentEmployee;
use App\Enums\ReportStatus;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil assignment employees yang sudah ada
        $assignmentEmployees = AssignmentEmployee::with(['assignment', 'user'])->get();

        if ($assignmentEmployees->isEmpty()) {
            $this->command->info('Tidak ada assignment employees yang tersedia untuk membuat report.');
            return;
        }

        $reportTypes = ['in_city', 'out_city', 'out_country'];
        $cities = ['Bandung', 'Jakarta', 'Surabaya', 'Semarang', 'Yogyakarta', 'Malang', 'Medan', 'Palembang'];
        $transportationTypes = ['air', 'sea', 'land'];

        foreach ($assignmentEmployees as $index => $assignmentEmployee) {
            $reportType = $reportTypes[$index % count($reportTypes)];
            $destinationCity = $cities[$index % count($cities)];
            
            $report = Report::create([
                'user_id' => $assignmentEmployee->user_id,
                'assignment_id' => $assignmentEmployee->assignment_id,
                'travel_type' => $reportType,
                'travel_order_number' => 'ST-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '-2025',
                'destination_city' => $destinationCity,
                'departure_date' => $departureDate = now()->subDays(rand(15, 45))->format('Y-m-d'),
                'return_date' => $returnDate = now()->subDays(rand(5, 14))->format('Y-m-d'),
                'actual_duration' => $departureDate - $returnDate,
                'travel_purpose' => 'Perjalanan dinas untuk ' . $destinationCity . ' - ' . ($reportType === 'in_city' ? 'Dalam Kota' : 'Luar Kota'),
                'travel_order_file' => 'sample_travel_order_' . ($index + 1) . '.pdf',
                'spd_file' => 'sample_spd_' . ($index + 1) . '.pdf',
            ]);

            // Attach transportation type
            $transportationTypeId = ($index % 3) + 1; // 1, 2, atau 3
            $report->transportationTypes()->attach($transportationTypeId);
        }

        $this->command->info('Report seeder berhasil dijalankan.');
    }
}
