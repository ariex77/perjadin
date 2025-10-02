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
        Schema::create('report_transportation_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->foreignId('transportation_type_id')->constrained('transportation_types')->onDelete('cascade');
            $table->timestamps();
            
            // Prevent duplicate combinations
            $table->unique(['report_id', 'transportation_type_id'], 'report_transport_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_transportation_types');
    }
};
