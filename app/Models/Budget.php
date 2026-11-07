<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    public $fillable = [
        'user_id',
        'category_id',
        'amount',
        'period',
        'purpose',
        'start_date',
        'end_date',
        'auto_reset'
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category associated with the budget.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
