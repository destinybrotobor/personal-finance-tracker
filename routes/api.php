<?php
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Models\Transaction;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('transactions')->group(function () {
        Route::get('fetch-categories', [TransactionController::class, 'fetchCategories'])->name('api.fetch-transaction-categories');
        Route::post('add-category', [TransactionController::class, 'addCategory'])->name('api.add-transaction-category');
        Route::delete('delete-category/{id}', [TransactionController::class, 'deleteCategory'])->name('api.delete-transaction-category');
        Route::get('fetch-transactions', [TransactionController::class, 'fetchTransactions'])->name('api.fetch-transactions');
        Route::get('filter-transactions', [TransactionController::class, 'filterTransactions'])->name('api.filter-transactions');
        Route::get('fetch-dashboard-transactions', [TransactionController::class, 'fetchDashboardTransactions'])->name('api.fetch-dashboard-transactions');
        Route::get('fetch-chart-data', [TransactionController::class, 'fetchChartData'])->name('api.fetch-chart-data');
        Route::get('fetch-dashboard-analysis', [TransactionController::class, 'fetchDashboardAnalysis'])->name('api.fetch-dashboard-analysis');
        Route::post('add-transaction', [TransactionController::class, 'addTransaction'])->name('api.add-transaction');
        Route::delete('delete-transaction/{id}', [TransactionController::class, 'deleteTransaction'])->name('api.delete-transaction');
        Route::post('/', [TransactionController::class, 'store'])->name('api.transactions.store');
    });

    Route::prefix('budgets')->group(function () {
        Route::get('fetch-budgets', [BudgetController::class, 'fetchBudgets'])->name('api.fetch-budgets');
        Route::post('add-budget', [BudgetController::class, 'addBudget'])->name('api.add-budget');
        Route::put('update-budget/{id}', [BudgetController::class, 'updateBudget'])->name('api.update-budget');
        Route::delete('delete-budget/{id}', [BudgetController::class, 'deleteBudget'])->name('api.delete-budget');
        Route::get('fetch-budget-chart-data', [BudgetController::class, 'budgetChartData'])->name('api.fetch-budget-chart-data');
    });

    Route::prefix('notifications')->group(function () {
        Route::get('fetch-notifications', [UserController::class, 'fetchNotifications'])->name('api.fetch-notifications');
        Route::get('fetch-unread-notifications', [UserController::class, 'fetchUnreadNotifications'])->name('api.fetch-unread-notifications');
        Route::post('mark-as-read', [UserController::class, 'markAsRead'])->name('api.mark-as-read');
        Route::post('mark-all-as-read', [UserController::class, 'markAllAsRead'])->name('api.mark-all-as-read');
    });

    // Route::get('fetch-feedbacks', [UserController::class, 'fetchFeedbacks'])->name('api.fetch-feedbacks');
    Route::post('submit-feedback', [UserController::class, 'submitFeedback'])->name('api.submit-feedback');
    Route::get('fetch-feedbacks', [UserController::class, 'fetchFeedbacks'])->name('api.fetch-feedbacks');
});

