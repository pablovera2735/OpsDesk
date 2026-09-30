<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            $table->string('asset_code')->unique();
            $table->string('hostname')->nullable();

            $table->string('type');

            $table->string('brand')->nullable();
            $table->string('model')->nullable();

            $table->string('serial_number')->nullable()->unique();

            $table->string('operating_system')->nullable();

            $table->string('ip_address')->nullable();
            $table->string('mac_address')->nullable();

            $table->string('status')->default('active');

            $table->foreignId('assigned_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};