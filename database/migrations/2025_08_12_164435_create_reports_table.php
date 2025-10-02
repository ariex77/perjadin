<?php

use App\Enums\TravelType;
use App\Enums\TransportationType;
use App\Enums\ReportStatus;
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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            
            // Status dan tipe laporan
            $table->enum('travel_type', array_column(TravelType::cases(), 'value'));
            $table->enum('status', array_column(ReportStatus::cases(), 'value'))->default(ReportStatus::DRAFT->value);
            
            // Informasi Surat Tugas
            $table->string('travel_order_number')->comment('Nomor Surat Tugas');
            $table->string('destination_city')->comment('Tempat/Kota Tujuan');
            $table->integer('actual_duration')->comment('Durasi Asli Perjalanan');
            $table->date('departure_date')->comment('Tanggal Berangkat');
            $table->date('return_date')->comment('Tanggal Pulang');
            $table->text('travel_purpose')->comment('Maksud Perjalanan Dinas');
            $table->string('travel_order_file')->comment('File Surat Tugas');
            $table->string('spd_file')->comment('File SPD (Surat Perintah Dinas)');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
