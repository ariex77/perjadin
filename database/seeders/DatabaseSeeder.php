<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WorkUnit;
use App\Models\Address;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\Gender;
use Database\Seeders\AssignmentSeeder;

class DatabaseSeeder extends Seeder
{
    private function createAddressForUser(User $user, int $index): void
    {
        $addresses = [
            [
                'address' => 'Jl. Sudirman No. 123',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Thamrin No. 45',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Gatot Subroto No. 67',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Jendral Sudirman No. 89',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Rasuna Said No. 12',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Kuningan No. 34',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Senayan No. 56',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Kebayoran Baru No. 78',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Menteng No. 90',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
            [
                'address' => 'Jl. Cikini No. 11',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
            ],
        ];

        $addressData = $addresses[$index % count($addresses)];
        
        Address::create([
            'user_id' => $user->id,
            'address' => $addressData['address'],
            'city' => $addressData['city'],
            'province' => $addressData['province'],
        ]);
    }

    public function run(): void
    {
                // 1) Seed work units & data master terlebih dahulu (tanpa role assignment)
        $this->call([
            RoleSeeder::class,
            WorkUnitSeeder::class,
            FullboardPriceSeeder::class,
            TransportationTypeSeeder::class,
        ]);

        // Ambil semua work unit
        $workUnits = WorkUnit::orderBy('code')->get();

        // 2) Buat 1 leader untuk setiap work unit
        foreach ($workUnits as $idx => $unit) {
            $n = str_pad((string)($idx + 1), 2, '0', STR_PAD_LEFT);

            $leader = User::create([
                'name'          => "Leader $n",
                'username'      => "leader$n",
                'email'         => "leader$n@example.com",
                'nip'           => str_pad("L" . $n, 18, '0', STR_PAD_RIGHT), // 18 digit NIP
                // Nomor telepon format: 08xx-xxxx-xxxx (12 digit)
                'number_phone'  => "08" . str_pad((string)(900000000 + $idx), 9, '0', STR_PAD_LEFT),
                'level'         => "IV/b",
                'gender'        => $idx % 2 === 0 ? Gender::MALE->value : Gender::FEMALE->value,
                'password'      => Hash::make('password'),
                'work_unit_id'  => $unit->id,
            ]);

            // Buat address untuk leader
            $this->createAddressForUser($leader, $idx);

            // 3) Set head_id untuk unit ini
            $unit->update(['head_id' => $leader->id]);
        }

        // 4) Seed user lain sesuai requirement
        // Admin 1-5 - distribusikan ke semua work unit
        for ($i = 1; $i <= 5; $i++) {
            $admin = User::create([
                'name'          => "Admin $i",
                'username'      => "admin$i",
                'email'         => "admin$i@example.com",
                'nip'           => str_pad("A" . str_pad($i, 3, '0', STR_PAD_LEFT), 18, '0', STR_PAD_RIGHT), // 18 digit NIP
                // Nomor telepon format: 0811-xxxx-xxxx (12 digit)
                'number_phone'  => "0811" . str_pad((string)$i, 8, '0', STR_PAD_LEFT),
                'level'         => "IV/a",
                'gender'        => $i % 2 ? Gender::MALE->value : Gender::FEMALE->value,
                'password'      => Hash::make('password'),
                'work_unit_id'  => $workUnits[($i - 1) % $workUnits->count()]->id,
            ]);

            // Buat address untuk admin
            $this->createAddressForUser($admin, $i + 5); // Offset 5 untuk admin
        }

        // Verifikator - hanya 1 saja
        $verifikator = User::create([
            'name'          => "Verifikator",
            'username'      => "verificator",
            'email'         => "verificator@example.com",
            'nip'           => str_pad("V001", 18, '0', STR_PAD_RIGHT), // 18 digit NIP
            // Nomor telepon format: 0844-xxxx-xxxx (12 digit)
            'number_phone'  => "084400000000",
            'level'         => "III/b",
            'gender'        => Gender::MALE->value,
            'password'      => Hash::make('password'),
            'work_unit_id'  => $workUnits->first()->id,
        ]);

        // Buat address untuk verifikator
        $this->createAddressForUser($verifikator, 10);

        // Rachel Ginting sebagai superadmin
        $userData = [
            'name'          => 'Rachel Ginting',
            'username'      => 'rachelginting',
            'email'         => 'rachelginting@example.com',
            'nip'           => str_pad('R001', 18, '0', STR_PAD_RIGHT), // 18 digit NIP
            // Nomor telepon format: 0812-xxxx-xxxx (12 digit)
            'number_phone'  => '081234567890',
            'level'         => 'IV/a',
            'gender'        => Gender::FEMALE->value,
            'password'      => Hash::make('password'),
            'work_unit_id'  => $workUnits->first()->id,
        ];
        
        $rachel = User::create($userData);

        // Buat address untuk Rachel Ginting
        $this->createAddressForUser($rachel, 11);

        // Employee 1-10 - distribusikan ke semua work unit
        for ($i = 1; $i <= 10; $i++) {
            $employee = User::create([
                'name'          => "Employee $i",
                'username'      => "employee$i",
                'email'         => "employee$i@example.com",
                'nip'           => str_pad("E" . str_pad($i, 3, '0', STR_PAD_LEFT), 18, '0', STR_PAD_RIGHT), // 18 digit NIP
                // Nomor telepon format: 0822-xxxx-xxxx (12 digit)
                'number_phone'  => "0822" . str_pad((string)$i, 8, '0', STR_PAD_LEFT),
                'level'         => "III/a",
                'gender'        => $i % 2 ? Gender::MALE->value : Gender::FEMALE->value,
                'password'      => Hash::make('password'),
                'work_unit_id'  => $workUnits[($i - 1) % $workUnits->count()]->id,
            ]);

            // Buat address untuk employee
            $this->createAddressForUser($employee, $i + 11); // Offset 11 untuk employee
        }

        // 5) Terakhir: buat roles & permissions lalu assign ke user yang sudah ada
        $this->call([
            RoleSeeder::class,
            // 6) Setelah role ter-assign, baru seed ticket agar tidak memakai admin/superadmin
            // 7) Seed assignment untuk user yang eligible
            AssignmentSeeder::class,
            // 8) Seed report untuk assignment yang sudah ada (dikomentari - isi manual)
            // ReportSeeder::class,
            // 10) Seed report review untuk testing status (dikomentari - isi manual)
            // ReportReviewSeeder::class,
        ]);
    }
}
