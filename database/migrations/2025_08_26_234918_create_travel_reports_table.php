<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('travel_reports', function (Blueprint $table) {
            $table->id();
            
            // Foreign key ke tabel reports
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            
            $table->string('title', 255)->nullable();

            // A. PENDAHULUAN
            // 1. Latar Belakang
            $table->text('background')->nullable()->comment('Latar belakang perjalanan dinas');
            
            // 2. Maksud dan Tujuan
            $table->text('purpose_and_objectives')->nullable()->comment('Maksud dan tujuan perjalanan dinas');
            
            // 3. Ruang Lingkup
            $table->text('scope')->nullable()->comment('Ruang lingkup kegiatan');
            
            // 4. Dasar Pelaksanaan
            $table->text('legal_basis')->nullable()->comment('Dasar hukum/pelaksanaan kegiatan');
            
            // B. KEGIATAN YANG DILAKSANAKAN
            $table->text('activities_conducted')->nullable()->comment('Deskripsi kegiatan yang dilaksanakan');
            
            // C. HASIL YANG DICAPAI
            $table->text('achievements')->nullable()->comment('Hasil yang dicapai');
            
            // D. KESIMPULAN DAN SARAN
            $table->text('conclusions')->nullable()->comment('Kesimpulan dari perjalanan dinas');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_reports');
    }
};
