<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Notifications\BudgetNotification;
use App\Traits\ResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Transaction;

class TransactionController extends Controller
{
    use ResponseTrait;

    public function fetchCategories(Request $request)
    {
        $categories = Category::orderBy('name')->get();
        return $this->successResponse('Categories fetched successfully', [
            'categories' => $categories
        ]);
    }

    public function addCategory(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'type' => 'required|string'
        ]);

        if ($validate->fails()) {
            return $this->errorResponse("Validation error", [
                'errors' => $validate->errors()
            ], 422);
        }

        $category = new Category();
        $category->type = strtolower($request->type);
        $category->name = strtolower($request->category);
        $category->save();

        return $this->successResponse('Category added successfully', [
            'category' => $category
        ]);
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return $this->successResponse('Category deleted successfully');
    }

    public function fetchTransactions(Request $request)
    {
        if ($request->has('type') && in_array(strtolower($request->type), ['income', 'expenses', 'savings'])) {
            $transactions = $request->user()->transactions()
                ->where('type', strtolower($request->type))
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            $transactions = $request->user()->transactions()
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }
        return $this->successResponse('Transactions fetched successfully', [
            'transactions' => $transactions
        ]);
    }

    public function filterTransactions(Request $request)
    {
        if ($request->has('type') && in_array(strtolower($request->type), ['income', 'expenses', 'savings'])) {
            $transactions = $request->user()->transactions()
                ->where('type', strtolower($request->type))
                ->whereBetween('transaction_date', [$request->start_date, $request->end_date])
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            $transactions = $request->user()->transactions()
                ->whereBetween('transaction_date', [$request->start_date, $request->end_date])
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }

        return $this->successResponse('Transactions fetched successfully', [
            'transactions' => $transactions
        ]);
    }

    public function fetchDashboardTransactions(Request $request)
    {
        $transactions = $request->user()->transactions()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return $this->successResponse('Dashboard transactions fetched successfully', [
            'transactions' => $transactions
        ]);
    }

    public function fetchChartData(Request $request)
    {
        // Start analysis from last 6 months
        $startMonth = Carbon::now()->subMonths(6)->format('Y-m');
        $chartData = [];

        for ($i = 0; $i <= 6; $i++) {
            $month = Carbon::parse($startMonth)->addMonths($i);
            $monthKey = $month->format('M');

            $expenses = $request->user()->transactions()
                ->where('type', 'expenses')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount');

            $income = $request->user()->transactions()
                ->where('type', 'income')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount');

            $chartData[$i] = [
                'month' => $monthKey,
                'expenses' => (float)$expenses,
                'income' => (float)$income,
            ];
        }

        $chartConfig = [
            'expenses' => [
                'label' => "Expenses",
                'color' => "var(--chart-1)",
            ],
            'income' => [
                'label' => "Income",
                'color' => "var(--chart-2)",
            ],
        ];

        return $this->successResponse('Chart data fetched successfully', [
            'chart_data' => $chartData,
            'chart_config' => $chartConfig,
        ]);
    }

    public function fetchDashboardAnalysis(Request $request)
    {
        $analysis = $request->user()->transactions()
            ->selectRaw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income')
            ->selectRaw('SUM(CASE WHEN type = "expenses" THEN amount ELSE 0 END) as total_expenses')
            ->selectRaw('SUM(CASE WHEN type = "savings" THEN amount ELSE 0 END) as total_savings')
            ->first();

        $unreadNotifications = $request->user()->notifications()->where('read_at', null)->count();

        return $this->successResponse('Dashboard analysis fetched successfully', [
            'analysis' => $analysis,
            'unread_notifications' => $unreadNotifications
        ]);
    }

    public function addTransaction(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'transaction_date' => 'required',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'description' => 'required|string',
        ]);

        if ($validate->fails()) {
            return $this->errorResponse("Validation error", [
                'errors' => $validate->errors()
            ], 422);
        }

        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $attachment) {
                $path = $attachment->store('attachments', 'public');
                $attachments[] = $path;
            }
        }

        // Find category with name
        $category = Category::where('name', $request->category)->first();

        $transaction = $request->user()->transactions()->create([
            'category_id' => $category ? $category->id : null,
            'amount' => $request->amount,
            'type' => strtolower($request->type),
            'transaction_date' => $request->transaction_date,
            'payment_method' => strtolower($request->payment_method),
            'attachments' => $attachments,
            'description' => $request->description
        ]);

        // Check and send notification on the category if almost or exceeds budget
        $totalBudget = $category->budget()->sum('amount');
        if ($category && $category->budget && $totalBudget > 0) {
            $remainingBudget = $totalBudget - $category->transactions()->sum('amount');
            if ($remainingBudget <= 0) {
                // Send notification for exceeding budget
                $request->user()->notify(new BudgetNotification($category->name, $totalBudget, $remainingBudget, 'exceeded'));
            } elseif ($remainingBudget <= 100 && $remainingBudget + $request->amount >= 70) {
                // Send notification for almost exceeding budget
                $request->user()->notify(new BudgetNotification($category->name, $totalBudget, $remainingBudget, 'almost exceeded'));
            }
        }

        return $this->successResponse('Transaction added successfully', [
            'transaction' => $transaction
        ]);
    }

    public function deleteTransaction(Request $request, $id)
    {
        $transaction = $request->user()->transactions()->findOrFail($id);
        $transaction->delete();

        return $this->successResponse('Transaction deleted successfully');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:income,expenses,savings',
            'amount' => 'required|numeric|min:0.01',
            'category_id' => 'nullable|exists:categories,id',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $transaction = Transaction::create(array_merge($data, ['user_id' => $request->user()->id]));

        return response()->json(['status' => 'success', 'transaction' => $transaction], 201);
    }
}
