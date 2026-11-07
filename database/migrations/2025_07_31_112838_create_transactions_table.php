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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->dateTime('transaction_date');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['income', 'expenses', 'savings']);
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->string('payment_method')->nullable();
            $table->string('description')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
