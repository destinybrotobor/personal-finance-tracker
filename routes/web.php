<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PageController;
use App\Http\Middleware\RegComplete;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PageController::class, 'index'])->name('home');
Route::get('about', [PageController::class, 'about'])->name('about');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [PageController::class, 'dashboard'])->name('dashboard');
    Route::get('transactions', [PageController::class, 'manageTransactions'])->name('manage_transactions');
    Route::get('budgeting', [PageController::class, 'budgeting'])->name('budgeting');
    Route::get('feedback', [PageController::class, 'feedback'])->name('feedback');
    Route::get('notifications', [PageController::class, 'notifications'])->name('notifications');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
