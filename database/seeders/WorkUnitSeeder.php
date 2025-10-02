<?php

namespace Database\Seeders;

use App\Models\WorkUnit;
use Illuminate\Database\Seeder;

class WorkUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'name' => 'PROSES BISNIS DAN SISTEM INFORMASI',
                'code' => '001',
                'description' => 'Tugas Tim Kerja Proses Bisnis dan Sistem',
            ],
            [
                'name' => 'SISTEM INFORMASI',
                'code' => '002',
                'description' => 'Tim Kerja Sistem Informasi',
            ],
            [
                'name' => 'PELAYANAN DATA OPERASIONAL',
                'code' => '003',
                'description' => 'Tim Kerja Pelayanan Data Operasional',
            ],
            [
                'name' => 'TATA USAHA DAN RUMAH TANGGA',
                'code' => '004',
                'description' => 'Tim Kerja Tata Usaha dan Rumah Tangga',
            ],
        ];

        // Idempotent: upsert berdasarkan unique key 'code'
        WorkUnit::upsert($units, ['code'], ['name', 'description', 'updated_at']);
    }
}
