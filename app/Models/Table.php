<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    protected $fillable = [
        'table_number',
        'capacity',
        'location',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get active order for this table (if any)
     */
    public function activeOrder()
    {
        return $this->orders()
            ->where('order_status', '!=', 'completed')
            ->where('payment_status', '!=', 'cancelled')
            ->latest()
            ->first();
    }
}

