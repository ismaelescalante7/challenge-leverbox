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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500); // Increased length for better flexibility
            $table->text('description');
            $table->enum('status', ['pending', 'in_progress', 'completed'])
                  ->default('pending');
            $table->date('due_date')->nullable();
            $table->foreignId('priority_id')
                  ->constrained('priorities')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete(); // Prevent deletion if tasks exist
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('status');
            $table->index('due_date');
            $table->index(['status', 'due_date']);
            $table->fullText(['title', 'description']); // Full-text search
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
