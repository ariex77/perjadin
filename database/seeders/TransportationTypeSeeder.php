<?php

namespace Database\Seeders;

use App\Models\TransportationType;
use Illuminate\Database\Seeder;

class TransportationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transportationTypes = [
            [
                'name' => 'air',
                'label' => 'Udara',
            ],
            [
                'name' => 'sea',
                'label' => 'Laut',
            ],
            [
                'name' => 'land',
                'label' => 'Darat',
            ],
        ];

        foreach ($transportationTypes as $type) {
            TransportationType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
