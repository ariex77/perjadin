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
        Schema::create('out_country_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports');
        
            // Transport asal
            $table->decimal('origin_transport_cost', 15, 2)->nullable()->comment('Transport ke Bandara Asal');
            $table->string('origin_transport_receipt')->nullable();
        
            // Tiket Internasional PP
            $table->decimal('international_ticket_cost', 15, 2)->nullable()->comment('Tiket Internasional PP');
            $table->string('international_ticket_receipt')->nullable();
        
            // Transport lokal di negara tujuan
            $table->decimal('local_transport_cost', 15, 2)->nullable()->comment('Transport Lokal di Negara Tujuan');
            $table->string('local_transport_receipt')->nullable();
        
            // Penginapan
            $table->decimal('lodging_cost', 15, 2)->nullable()->comment('Biaya Penginapan');
            $table->string('lodging_receipt')->nullable();
        
            // Uang harian
            $table->decimal('daily_allowance', 15, 2)->nullable()->comment('Uang Harian');
            $table->string('daily_allowance_receipt')->nullable();
        
            // Visa
            $table->decimal('visa_fee', 15, 2)->nullable()->comment('Biaya Visa');
            $table->string('visa_receipt')->nullable();
        
            // Asuransi perjalanan
            $table->decimal('travel_insurance_fee', 15, 2)->nullable()->comment('Asuransi Perjalanan');
            $table->string('travel_insurance_receipt')->nullable();
        
            // Pengeluaran riil
            $table->decimal('actual_expense', 15, 2)->nullable()->comment('Pengeluaran Riil');
            $table->string('actual_expense_receipt')->nullable();
        
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('out_county_reports');
    }
};
