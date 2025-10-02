<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('work_unit_id')
                ->references('id')
                ->on('work_units')
                ->cascadeOnDelete();
        });

        Schema::table('work_units', function (Blueprint $table) {
            if (!Schema::hasColumn('work_units', 'head_id')) {
                $table->foreignId('head_id')
                    ->nullable()
                    ->unique()
                    ->constrained('users')
                    ->nullOnDelete();
            } else {
                $table->foreign('head_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['work_unit_id']);
        });

        Schema::table('work_units', function (Blueprint $table) {
            if (Schema::hasColumn('work_units', 'head_id')) {
                $table->dropForeign(['head_id']);
                $table->dropColumn('head_id');
            }
        });
    }
};


