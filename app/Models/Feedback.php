<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'attachment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // cast attributes
    protected $casts = [
        'attachment' => 'array',
    ];
}
