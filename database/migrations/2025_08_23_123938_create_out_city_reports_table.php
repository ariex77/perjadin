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
        Schema::create('out_city_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->foreignId('fullboard_price_id')->nullable()->constrained('fullboard_prices')->onDelete('cascade');
            $table->decimal('custom_daily_allowance', 15, 2)->nullable()->comment('Uang Harian Custom (jika tidak menggunakan fullboard price)');

            // Transport asal
            $table->decimal('origin_transport_cost', 15, 2)->nullable()->comment('Transport Tempat Asal');
            $table->string('origin_transport_receipt')->nullable()->comment('Bukti Transport Tempat Asal');

            // Transport di daerah tujuan
            $table->decimal('local_transport_cost', 15, 2)->nullable()->comment('Transport Daerah di Lokasi Tujuan');
            $table->string('local_transport_receipt')->nullable()->comment('Bukti Transport Daerah');

            // Biaya penginapan (hotel)
            $table->decimal('lodging_cost', 15, 2)->nullable()->comment('Biaya Penginapan/Hotel');
            $table->string('lodging_receipt')->nullable()->comment('Bukti Penginapan/Hotel');

            // Biaya transportasi daerah tujuan
            $table->decimal('destination_transport_cost', 15, 2)->nullable()->comment('Transport Daerah di Lokasi Tujuan');
            $table->string('destination_transport_receipt')->nullable()->comment('Bukti Transport Daerah');

            // Tiket PP
            $table->decimal('round_trip_ticket_cost', 15, 2)->nullable()->comment('Tiket Pesawat/Transport PP');
            $table->string('round_trip_ticket_receipt')->nullable()->comment('Bukti Tiket Pesawat/Transport PP');

            $table->decimal('actual_expense', 15, 2)->nullable()->comment('Pengeluaran Riil');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('out_city_reports');
    }
};
