<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\BudgetNotification;
use Illuminate\Support\Collection;

class BudgetService
{
    /**
     * Get user budgets with spending analysis and trigger notifications
     */
    public function getUserBudgetsWithSpending(User $user): Collection
    {
        return $user->budgets()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Budget $budget) use ($user) {
                return $this->analyzeBudgetSpending($budget, $user);
            });
    }

    /**
     * Analyze budget spending and trigger notifications
     */
    public function analyzeBudgetSpending(Budget $budget, User $user): Budget
    {
        $spent = $this->calculateSpentAmount($budget);
        $percentage = $this->calculateSpentPercentage($spent, $budget->amount);

        $budget->spent = $spent;
        $budget->remaining = $budget->amount - $spent;
        $budget->progress_color = $this->getProgressColor($percentage);
        $budget->percentage = $percentage;

        $this->checkAndSendBudgetAlerts($budget, $user, $spent);

        return $budget;
    }

    /**
     * Calculate spent amount for a budget
     */
    private function calculateSpentAmount(Budget $budget): float
    {
        return Transaction::where('category_id', $budget->category_id)
            ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date])
            ->sum('amount');
    }

    /**
     * Calculate spent percentage
     */
    private function calculateSpentPercentage(float $spent, float $totalBudget): float
    {
        return $totalBudget > 0 ? ($spent / $totalBudget) * 100 : 0;
    }

    /**
     * Get progress color based on percentage
     */
    private function getProgressColor(float $percentage): string
    {
        return match (true) {
            $percentage < 70 => "#4caf50", // Green
            $percentage < 90 => "#ff9800", // Orange
            default => "#f44336", // Red
        };
    }

    /**
     * Check and send budget alerts
     */
    public function checkAndSendBudgetAlerts(Budget $budget, User $user, float $spent): void
    {
        $percentage = $this->calculateSpentPercentage($spent, $budget->amount);

        if ($this->isBudgetExceeded($percentage)) {
            $this->sendBudgetNotification($user, $budget, 'exceeded');
        } elseif ($this->isBudgetAlmostExceeded($percentage)) {
            $this->sendBudgetNotification($user, $budget, 'almost_exceeded');
        }
    }

    /**
     * Check if budget is exceeded (100% or more)
     */
    private function isBudgetExceeded(float $percentage): bool
    {
        return $percentage >= 100;
    }

    /**
     * Check if budget is almost exceeded (70% to 100%)
     */
    private function isBudgetAlmostExceeded(float $percentage): bool
    {
        return $percentage >= 70 && $percentage < 100;
    }

    /**
     * Send budget notification
     */
    private function sendBudgetNotification(User $user, Budget $budget, string $type): void
    {
        $user->notify(new BudgetNotification(
            $budget->category->name,
            $budget->amount,
            $budget->remaining,
            $type
        ));
    }

    /**
     * Get budgets by purpose
     */
    public function getBudgetsByPurpose(User $user, string $purpose): Collection
    {
        // Implement your specific logic for fetching budgets by purpose
        return $user->budgets()
            ->whereHas('category', function ($query) use ($purpose) {
                $query->where('type', $purpose);
            })
            ->with('category')
            ->get()
            ->map(function (Budget $budget) use ($user) {
                return $this->analyzeBudgetSpending($budget, $user);
            });
    }
}
