<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Notifications\BudgetNotification;
use App\Services\BudgetService;
use Illuminate\Support\Facades\Validator;

class BudgetController extends Controller
{
    use ResponseTrait;

    public function __construct(
        private BudgetService $budgetService
    ) {}

    /**
     * Fetch all budgets for the authenticated user.
     */
    public function fetchBudgets(Request $request)
    {
        $budgets = $request->user()->budgets()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($budgets as $budget) {
            $spent = Transaction::where('category_id', $budget->category_id)
                ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date])
                ->sum('amount');

            $category = $budget->category;
            $percentage = ($spent / $budget->amount) * 100;
            $budget->spent = $spent;
            $budget->remaining = $budget->amount - $spent;
            $budget->progress_color = ($percentage < 70) ? "#4caf50" : (($percentage < 90) ? "#ff9800" : "#f44336");
            $budget->percentage = $percentage;

            // Check and send notification on the category if almost or exceeds budget
            $totalBudget = $budget->amount;
            if ($budget->remaining <= 0) {
                // Send notification for exceeding budget
                $request->user()->notify(new BudgetNotification($category->name, $totalBudget, $budget->remaining, 'exceeded'));
            } elseif (($budget->remaining + $spent) >= 70 && ($budget->remaining + $spent) <= 100) {
                // Send notification for almost exceeding budget
                $request->user()->notify(new BudgetNotification($category->name, $totalBudget, $budget->remaining, 'almost exceeded'));
            }
        }

        $budgetsOnPurpose['savings'] = $this->fetchBudgetsOnPurpose($request->user(), 'Savings');
        $budgetsOnPurpose['expenses'] = $this->fetchBudgetsOnPurpose($request->user(), 'Expenses');

        return $this->successResponse('Budgets fetched successfully', [
            'budgets' => $budgets,
            'budgets_on_purpose' => $budgetsOnPurpose
        ]);
    }

    /**
     * Fetch user budgets with spending analysis and trigger notifications
     */
    // public function fetchBudgets(Request $request)
    // {
    //     try {
    //         $user = $request->user();

    //         $budgets = $this->budgetService->getUserBudgetsWithSpending($user);
    //         $budgetsOnPurpose = $this->getBudgetsOnPurpose($user);

    //         return $this->successResponse('Budgets fetched successfully', [
    //             'budgets' => $budgets,
    //             'budgets_on_purpose' => $budgetsOnPurpose
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to fetch budgets: ' . $e->getMessage(), [
    //             'user_id' => $request->user()->id,
    //             'exception' => $e
    //         ]);

    //         return $this->errorResponse('Failed to fetch budgets', [
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Get budgets categorized by purpose
     */
    private function getBudgetsOnPurpose($user): array
    {
        return [
            'savings' => $this->budgetService->getBudgetsByPurpose($user, 'Savings'),
            'expenses' => $this->budgetService->getBudgetsByPurpose($user, 'Expenses'),
        ];
    }

    private function fetchBudgetsOnPurpose(User $user, string $purpose)
    {
        // Sum all budgets for the given purpose
        $budgets = $user->budgets()->where('purpose', $purpose)->get();
        $total_amount = $budgets->sum('amount');
        $start_date = $budgets->min('start_date');
        $end_date = $budgets->max('end_date');

        // Get all category IDs for this purpose
        $categoryIds = $budgets->pluck('category_id')->unique()->toArray();

        // Fetch all transactions for these categories
        $transactions = Transaction::whereIn('category_id', $categoryIds);
        if ($start_date && $end_date) {
            $transactions = $transactions->whereBetween('transaction_date', [$start_date, $end_date]);
        }

        // For Savings, 'total_spent' means 'saved', for Expenses, it means 'spent'
        if ($purpose === 'Savings') {
            $total_budget = $total_amount;
            $total_saved = $transactions->sum('amount');
            $extra_saved = $total_saved > $total_budget ? $total_saved - $total_budget : 0;

            return [
                "$purpose" => [
                    'total_amount' => $total_amount,
                    'total_saved' => $total_saved,
                    'extra_saved' => $extra_saved,
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                    'budgets' => $budgets,
                    'purpose' => $purpose
                ]
            ];
        } else if ($purpose === 'Expenses') {
            $total_budget = $total_amount;
            $total_spent = $transactions->sum('amount');
            $remaining_budget = $total_budget - $total_spent;

            return [
                "$purpose" => [
                    'total_amount' => $total_amount,
                    'total_spent' => $total_spent,
                    'remaining_budget' => $remaining_budget,
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                    'budgets' => $budgets,
                    'purpose' => $purpose
                ]
            ];
        }
    }

    public function addBudget(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'period' => 'nullable|in:daily,weekly,monthly,yearly',
            'purpose' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validate->fails()) {
            return $this->errorResponse('Validation failed', [
                'errors' => $validate->errors()
            ], 422);
        }

        if ($request->period === 'weekly') {
            $start_date = now()->startOfWeek();
            $end_date = now()->endOfWeek();
        } else if ($request->period === 'monthly') {
            $start_date = now()->startOfMonth();
            $end_date = now()->endOfMonth();
        } else if ($request->period === 'yearly') {
            $start_date = now()->startOfYear();
            $end_date = now()->endOfYear();
        } else {
            $start_date = $request->start_date ?? now();
            $end_date = $request->end_date ?? now()->addMonth();
        }

        $budget = $request->user()->budgets()->create([
            'category_id' => $request->category_id,
            'amount' => $request->amount,
            'period' => $request->period,
            'purpose' => $request->purpose,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'auto_reset' => filter_var($request->auto_reset, FILTER_VALIDATE_BOOLEAN) ?? true
        ]);

        return $this->successResponse('Budget added successfully', [
            'budget' => $budget
        ]);
    }

    public function updateBudget($id, Request $request)
    {
        // Logic to update a budget
        return response()->json(['message' => 'Budget updated successfully']);
    }

    public function deleteBudget($id)
    {
        // Logic to delete a budget
        return response()->json(['message' => 'Budget deleted successfully']);
    }

    // Budget Chart Data
    public function budgetChartData(Request $request)
    {
        $budgets = $request->user()->budgets()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        $chartData = [];
        $chartConfig = [];
        $colors = ['#eab308', '#f97316', '#ec4899', '#8b5cf6', '#3b82f6'];
        $colorIndex = 0;

        foreach ($budgets as $budget) {
            $categoryName = strtolower($budget->category->name);
            $color = $colors[$colorIndex % count($colors)];

            $chartData[] = [
                'label' => $categoryName,
                'values' => $budget->amount,
                'fill' => $color
            ];

            $chartConfig[$categoryName] = [
                'label' => ucfirst($categoryName),
                'color' => $color
            ];

            $colorIndex++;
        }
        $id = 'budget-chart';
        return $this->successResponse('Budgets fetched successfully', [
            'budgets' => $budgets,
            'chartData' => $chartData,
            'chartConfig' => $chartConfig,
            'id' => $id
        ]);
    }
}
