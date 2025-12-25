<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'image',
        'badge',
        'price',
        'unit',
        'status',
        'stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Automatically hide menu when stock is 0
     * Only auto-hide if status is not being explicitly changed
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($menuItem) {
            // Auto-hide menu if stock is 0, but only if status is not being explicitly changed
            // If status is dirty (being changed), respect the manual change
            if ($menuItem->stock <= 0 && !$menuItem->isDirty('status')) {
                $menuItem->status = 'hidden';
            }
            // If status is being set to 'available' manually, allow it even if stock is 0
            // (Admin can manually show items even with 0 stock)
        });
    }

    /**
     * Scope to get only available menu items
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope to get hidden menu items
     */
    public function scopeHidden($query)
    {
        return $query->where('status', 'hidden');
    }
}
