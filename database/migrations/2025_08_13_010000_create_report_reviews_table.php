<?php

use App\Enums\ReviewerType;
use App\Enums\ReviewStatus;
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
        Schema::create('report_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            
            // Tipe reviewer (Pejabat Pembuat Komitmen / Ketua Seksi)
            $table->enum('reviewer_type', array_column(ReviewerType::cases(), 'value'));
            
            // Status review
            $table->enum('status', array_column(ReviewStatus::cases(), 'value'));
            
            // Feedback dari reviewer
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Index untuk performa query
            $table->index(['report_id', 'reviewer_type']);
            $table->index(['reviewer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_reviews');
    }
};
