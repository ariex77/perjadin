<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ubah foreign key: dari cascadeOnDelete -> restrictOnDelete
            $table->dropForeign(['work_unit_id']);
            $table->foreign('work_unit_id')
                ->references('id')
                ->on('work_units')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kembalikan ke cascadeOnDelete jika rollback
            $table->dropForeign(['work_unit_id']);
            $table->foreign('work_unit_id')
                ->references('id')
                ->on('work_units')
                ->cascadeOnDelete();
        });
    }
};


