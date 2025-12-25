<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    /**
     * Display a listing of tables.
     */
    public function index(Request $request)
    {
        $tables = Table::withCount('orders')
            ->orderBy('table_number')
            ->get();
        
        // If it's an API request (AJAX), return JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'tables' => $tables
            ]);
        }
        
        return Inertia::render('Tables', [
            'tables' => $tables
        ]);
    }

    /**
     * Store a newly created table.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|max:50|unique:tables,table_number',
            'capacity' => 'required|integer|min:1|max:20',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|in:available,occupied,reserved',
        ]);

        $validated['status'] = $validated['status'] ?? 'available';

        $table = Table::create($validated);

        return response()->json([
            'message' => 'Tabel berhasil ditambahkan',
            'table' => $table
        ]);
    }

    /**
     * Update the specified table.
     */
    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|max:50|unique:tables,table_number,' . $table->id,
            'capacity' => 'required|integer|min:1|max:20',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|in:available,occupied,reserved',
        ]);

        $table->update($validated);

        return response()->json([
            'message' => 'Tabel berhasil diperbarui',
            'table' => $table
        ]);
    }

    /**
     * Remove the specified table.
     */
    public function destroy(Table $table)
    {
        // Check if table has active orders
        $activeOrder = $table->activeOrder();
        if ($activeOrder) {
            return response()->json([
                'message' => 'Tidak dapat menghapus tabel yang sedang digunakan'
            ], 400);
        }

        $table->delete();

        return response()->json([
            'message' => 'Tabel berhasil dihapus'
        ]);
    }

    /**
     * Toggle table status
     */
    public function toggleStatus(Table $table)
    {
        $newStatus = $table->status === 'available' ? 'occupied' : 'available';
        $table->status = $newStatus;
        $table->save();

        return response()->json([
            'message' => 'Status tabel berhasil diubah',
            'table' => $table
        ]);
    }

    /**
     * Reserve a table for a user
     */
    public function reserve(Request $request, Table $table)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if ($table->status === 'occupied') {
            return response()->json([
                'message' => 'Tabel sedang digunakan'
            ], 400);
        }

        $table->status = 'reserved';
        $table->save();

        return response()->json([
            'message' => 'Tabel berhasil direservasi',
            'table' => $table
        ]);
    }
}

