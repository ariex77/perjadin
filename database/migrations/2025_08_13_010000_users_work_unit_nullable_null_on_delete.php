<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Jadikan kolom nullable
            $table->unsignedBigInteger('work_unit_id')->nullable()->change();

            // Ubah FK menjadi nullOnDelete
            $table->dropForeign(['work_unit_id']);
            $table->foreign('work_unit_id')
                ->references('id')
                ->on('work_units')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kembalikan ke not nullable dan restrictOnDelete
            $table->dropForeign(['work_unit_id']);
            $table->unsignedBigInteger('work_unit_id')->nullable(false)->change();
            $table->foreign('work_unit_id')
                ->references('id')
                ->on('work_units')
                ->restrictOnDelete();
        });
    }
};


