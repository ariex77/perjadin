<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Assignment;
use App\Models\User;
use Carbon\Carbon;

class AssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hanya ambil user dengan role 'employee'
        $users = User::whereHas('roles', function ($query) {
            $query->where('name', 'employee');
        })->get();

        $leaders = User::whereHas('roles', function ($query) {
            $query->where('name', 'leader');
        })->get();

        if ($users->isEmpty()) {
            $this->command->info('Tidak ada employee yang tersedia untuk membuat assignment.');
            return;
        }

        if ($leaders->isEmpty()) {
            $this->command->info('Tidak ada employee yang tersedia untuk membuat assignment.');
            return;
        }

        $this->command->info('Membuat assignment untuk ' . $users->count() . ' employee...');

        $assignmentTemplates = [
            // Assignment 1 untuk setiap employee
            [
                'purpose' => 'Kunjungan kerja ke kantor cabang',
                'destination' => 'Jakarta',
                'start_date' => '2025-01-15',
                'end_date' => '2025-01-17',
            ],
            [
                'purpose' => 'Pelatihan sistem baru',
                'destination' => 'Bandung',
                'start_date' => '2025-02-10',
                'end_date' => '2025-02-12',
            ],
            [
                'purpose' => 'Rapat koordinasi regional',
                'destination' => 'Surabaya',
                'start_date' => '2025-03-05',
                'end_date' => '2025-03-07',
            ],
            [
                'purpose' => 'Audit internal',
                'destination' => 'Medan',
                'start_date' => '2025-04-20',
                'end_date' => '2025-04-22',
            ],
            [
                'purpose' => 'Workshop pengembangan SDM',
                'destination' => 'Yogyakarta',
                'start_date' => '2025-05-10',
                'end_date' => '2025-05-12',
            ],
            [
                'purpose' => 'Seminar teknologi terbaru',
                'destination' => 'Semarang',
                'start_date' => '2025-06-15',
                'end_date' => '2025-06-17',
            ],
            [
                'purpose' => 'Koordinasi dengan mitra bisnis',
                'destination' => 'Palembang',
                'start_date' => '2025-07-20',
                'end_date' => '2025-07-22',
            ],
            [
                'purpose' => 'Pelatihan kepemimpinan',
                'destination' => 'Malang',
                'start_date' => '2025-08-25',
                'end_date' => '2025-08-27',
            ],
            [
                'purpose' => 'Rapat evaluasi kinerja',
                'destination' => 'Makassar',
                'start_date' => '2025-09-30',
                'end_date' => '2025-10-02',
            ],
            [
                'purpose' => 'Konferensi industri',
                'destination' => 'Denpasar',
                'start_date' => '2025-11-05',
                'end_date' => '2025-11-07',
            ],
            [
                'purpose' => 'Pelatihan keamanan siber',
                'destination' => 'Manado',
                'start_date' => '2025-12-10',
                'end_date' => '2025-12-12',
            ],
            [
                'purpose' => 'Workshop inovasi produk',
                'destination' => 'Padang',
                'start_date' => '2025-01-15',
                'end_date' => '2025-01-17',
            ],
        ];

        $cities = [
            'Jakarta',
            'Bandung',
            'Surabaya',
            'Medan',
            'Yogyakarta',
            'Semarang',
            'Palembang',
            'Malang',
            'Makassar',
            'Denpasar',
            'Manado',
            'Padang',
            'Balikpapan',
            'Pontianak',
            'Samarinda'
        ];

        $purposes = [
            'Kunjungan kerja ke kantor cabang',
            'Pelatihan sistem baru',
            'Rapat koordinasi regional',
            'Audit internal',
            'Workshop pengembangan SDM',
            'Seminar teknologi terbaru',
            'Koordinasi dengan mitra bisnis',
            'Pelatihan kepemimpinan',
            'Rapat evaluasi kinerja',
            'Konferensi industri',
            'Pelatihan keamanan siber',
            'Workshop inovasi produk',
            'Meeting dengan klien',
            'Pelatihan soft skill',
            'Rapat strategi bisnis'
        ];

        $assignmentCount = 0;

        foreach ($users as $user) {
            // Buat 3 assignment untuk setiap employee
            for ($i = 1; $i <= 3; $i++) {
                $randomCity = $cities[array_rand($cities)];
                $randomPurpose = $purposes[array_rand($purposes)];

                // Generate tanggal dalam bulan ini (September 2025) untuk memastikan dashboard menampilkan data
                $currentMonth = now()->month;
                $currentYear = now()->year;

                // Leader yang buat
                $randomLeader = $leaders->random();


                // Buat tanggal random dalam bulan ini
                $startDay = rand(1, 25); // Hari 1-25 untuk memastikan ada ruang untuk end_date
                $startDate = Carbon::createFromDate($currentYear, $currentMonth, $startDay)->format('Y-m-d');
                $endDate = Carbon::createFromDate($currentYear, $currentMonth, $startDay + rand(1, 3))->format('Y-m-d');

                $assignment = Assignment::create([
                    'purpose' => $randomPurpose . ' di ' . $randomCity,
                    'destination' => $randomCity,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'user_id' => $randomLeader->id,
                ]);

                // Attach user ke assignment dengan metadata yang benar
                $assignment->users()->attach($user->id, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $assignmentCount++;
            }
        }

        $this->command->info('Berhasil membuat ' . $assignmentCount . ' assignment untuk ' . $users->count() . ' employee.');
    }
}
