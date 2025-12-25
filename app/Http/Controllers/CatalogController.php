<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::withCount('menuItems')->get();
        $query = MenuItem::with('category')
            ->where('status', 'available'); // Only show available menu items

        // ini baut filter kategori
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // ini buat search filter
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $menuItems = $query->get();

        return Inertia::render('Catalog', [
            'categories' => $categories,
            'menuItems' => $menuItems,
        ]);
    }
}
