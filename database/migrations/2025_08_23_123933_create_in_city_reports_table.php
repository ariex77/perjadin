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
        Schema::create('in_city_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->decimal('daily_allowance', 15, 2)->comment('Uang Harian');
            $table->decimal('transportation_cost', 15, 2)->nullable()->comment('Biaya Transport');
            $table->decimal('vehicle_rental_fee', 15, 2)->nullable()->comment('Sewa Kendaraan');
            $table->decimal('actual_expense', 15, 2)->nullable()->comment('Pengeluaran Riil');
            $table->string('transportation_receipt')->nullable();
            $table->string('vehicle_rental_receipt')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('in_city_reports');
    }
};
