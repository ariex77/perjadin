<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FullboardPrice;

class FullboardPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prices = collect([
            ['province_name' => 'Aceh', 'price' => 360000],
            ['province_name' => 'Sumatra Utara', 'price' => 370000],
            ['province_name' => 'Riau', 'price' => 370000],
            ['province_name' => 'Kepulauan Riau', 'price' => 370000],
            ['province_name' => 'Jambi', 'price' => 370000],
            ['province_name' => 'Sumatra Barat', 'price' => 380000],
            ['province_name' => 'Sumatra Selatan', 'price' => 380000],
            ['province_name' => 'Lampung', 'price' => 380000],
            ['province_name' => 'Bengkulu', 'price' => 380000],
            ['province_name' => 'Bangka Belitung', 'price' => 410000],
            ['province_name' => 'Banten', 'price' => 370000],
            ['province_name' => 'Jawa Barat', 'price' => 430000],
            ['province_name' => 'DKI Jakarta', 'price' => 530000],
            ['province_name' => 'Jawa Tengah', 'price' => 370000],
            ['province_name' => 'D.I. Yogyakarta', 'price' => 420000],
            ['province_name' => 'Jawa Timur', 'price' => 410000],
            ['province_name' => 'Bali', 'price' => 480000],
            ['province_name' => 'Nusa Tenggara Barat', 'price' => 440000],
            ['province_name' => 'Nusa Tenggara Timur', 'price' => 430000],
            ['province_name' => 'Kalimantan Barat', 'price' => 380000],
            ['province_name' => 'Kalimantan Tengah', 'price' => 360000],
            ['province_name' => 'Kalimantan Selatan', 'price' => 380000],
            ['province_name' => 'Kalimantan Timur', 'price' => 430000],
            ['province_name' => 'Kalimantan Utara', 'price' => 430000],
            ['province_name' => 'Sulawesi Utara', 'price' => 370000],
            ['province_name' => 'Gorontalo', 'price' => 370000],
            ['province_name' => 'Sulawesi Barat', 'price' => 410000],
            ['province_name' => 'Sulawesi Selatan', 'price' => 430000],
            ['province_name' => 'Sulawesi Tengah', 'price' => 370000],
            ['province_name' => 'Sulawesi Tenggara', 'price' => 380000],
            ['province_name' => 'Maluku', 'price' => 380000],
            ['province_name' => 'Maluku Utara', 'price' => 430000],
            ['province_name' => 'Papua', 'price' => 580000],
            ['province_name' => 'Papua Barat', 'price' => 480000],
            ['province_name' => 'Papua Barat Daya', 'price' => 480000],
            ['province_name' => 'Papua Tengah', 'price' => 580000],
            ['province_name' => 'Papua Selatan', 'price' => 580000],
            ['province_name' => 'Papua Pegunungan', 'price' => 580000],
        ]);

        // Pola collect()->each() dengan idempotensi via updateOrCreate
        $prices->each(function (array $priceItem): void {
            FullboardPrice::updateOrCreate(
                ['province_name' => $priceItem['province_name']],
                ['price' => $priceItem['price']]
            );
        });
    }
}
