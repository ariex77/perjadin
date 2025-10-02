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
        Schema::table('out_city_reports', function (Blueprint $table) {
            // Mengubah actual_expense menjadi nullable
            $table->decimal('actual_expense', 15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('out_city_reports', function (Blueprint $table) {
            // Kembalikan actual_expense menjadi not nullable
            $table->decimal('actual_expense', 15, 2)->nullable(false)->change();
        });
    }
};
