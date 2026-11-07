<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        return inertia('Index', [
            'title' => 'Welcome to Finance Tracker',
            'description' => 'Take Control of Your Financial Future',
        ]);
    }
    public function about()
    {
        return inertia('About', [
            'title' => 'About Us',
            'description' => 'Learn more about Finance Tracker App',
        ]);
    }

    public function dashboard()
    {
        return inertia('app/Dashboard');
    }

    public function manageTransactions()
    {
        return inertia('app/ManageTransactions');
    }

    public function budgeting()
    {
        return inertia('app/Budgeting');
    }

    public function feedback()
    {
        return inertia('app/Feedback');
    }

    public function notifications()
    {
        return inertia('app/Notifications');
    }
}
