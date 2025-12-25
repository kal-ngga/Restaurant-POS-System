<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $menuItems = MenuItem::with('category')->orderBy('title')->get();
        $categories = Category::orderBy('name')->get();
        
        // If it's an API request (AJAX), return JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'menuItems' => $menuItems,
                'categories' => $categories
            ]);
        }
        
        return Inertia::render('MenuItems', [
            'menuItems' => $menuItems,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:available,hidden',
        ]);

        // Set default values
        $validated['stock'] = $validated['stock'] ?? 0;
        $validated['status'] = $validated['status'] ?? ($validated['stock'] > 0 ? 'available' : 'hidden');

        $menuItem = MenuItem::create($validated);

        return response()->json([
            'message' => 'Menu item berhasil ditambahkan',
            'menuItem' => $menuItem->load('category')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:available,hidden',
        ]);

        $menuItem->update($validated);

        return response()->json([
            'message' => 'Menu item berhasil diperbarui',
            'menuItem' => $menuItem->load('category')
        ]);
    }

    /**
     * Toggle menu status (hide/unhide)
     */
    public function toggleStatus(MenuItem $menuItem)
    {
        // Handle null status as 'available'
        $currentStatus = $menuItem->status ?? 'available';
        $newStatus = $currentStatus === 'available' ? 'hidden' : 'available';
        
        // Use DB::table to update directly, bypassing model events (boot method)
        DB::table('menu_items')
            ->where('id', $menuItem->id)
            ->update(['status' => $newStatus]);

        // Reload to get fresh data
        $menuItem->refresh();
        $menuItem->load('category');

        return response()->json([
            'message' => 'Status menu berhasil diubah',
            'menuItem' => $menuItem,
            'oldStatus' => $currentStatus,
            'newStatus' => $newStatus
        ]);
    }

    /**
     * Hide menu item instead of deleting (soft delete)
     * Menu data is preserved in database for transaction history
     */
    public function destroy(MenuItem $menuItem)
    {
        // Instead of deleting, just hide the menu
        $menuItem->status = 'hidden';
        $menuItem->save();

        return response()->json([
            'message' => 'Menu item berhasil disembunyikan (data tetap tersimpan di database)'
        ]);
    }
}
