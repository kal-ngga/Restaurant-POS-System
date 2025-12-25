<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CartController;

// Public routes
Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::get('/login', [AuthController::class, 'showLogin'])->name('login.show');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');

// Direct access routes for admin and customer
// These can be opened in separate tabs - each will redirect to login if not authenticated
Route::get('/admin', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role === 'admin') {
            return redirect('/dashboard');
        } else {
            return redirect('/login')->with('error', 'Anda harus login sebagai admin');
        }
    }
    return redirect('/login?redirect=/dashboard');
})->name('admin');

Route::get('/customer', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role === 'customer') {
            return redirect('/catalog');
        } else {
            return redirect('/login')->with('error', 'Anda harus login sebagai customer');
        }
    }
    return redirect('/login?redirect=/catalog');
})->name('customer');

Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected routes
Route::middleware('auth')->group(function () {
    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('cart.index');
        Route::post('/add', [CartController::class, 'add'])->name('cart.add');
        Route::put('/update/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('/remove/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
        Route::post('/clear', [CartController::class, 'clear'])->name('cart.clear');
        Route::post('/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
    });

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');
        
        // Dashboard metrics API (polled by frontend)
        Route::get('/dashboard/metrics', [\App\Http\Controllers\DashboardController::class, 'metrics'])->name('dashboard.metrics');
        
        // Transactions management page
        Route::get('/transactions', function () {
            return Inertia::render('Transactions');
        })->name('transactions');
        
        // Order routes
        Route::prefix('orders')->group(function () {
            Route::get('/', [\App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
            Route::get('/summary', [\App\Http\Controllers\OrderController::class, 'getSummary'])->name('orders.summary');
            // Detail page route must come before show route
            Route::get('/{order}/detail', function ($order) {
                return Inertia::render('OrderDetail', ['orderId' => $order]);
            })->name('orders.detail');
            Route::get('/{order}', [\App\Http\Controllers\OrderController::class, 'show'])->name('orders.show');
            Route::put('/{order}', [\App\Http\Controllers\OrderController::class, 'update'])->name('orders.update');
            Route::delete('/{order}', [\App\Http\Controllers\OrderController::class, 'destroy'])->name('orders.destroy');
            Route::put('/{order}/items/{orderItem}', [\App\Http\Controllers\OrderController::class, 'updateItem'])->name('orders.items.update');
            Route::delete('/{order}/items/{orderItem}', [\App\Http\Controllers\OrderController::class, 'deleteItem'])->name('orders.items.destroy');
        });

        // Category routes
        Route::prefix('categories')->group(function () {
            Route::get('/', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
            Route::post('/', [\App\Http\Controllers\CategoryController::class, 'store'])->name('categories.store');
            Route::put('/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->name('categories.update');
            Route::delete('/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->name('categories.destroy');
        });

        // Menu Item routes
        Route::prefix('menu-items')->group(function () {
            Route::get('/', [\App\Http\Controllers\MenuItemController::class, 'index'])->name('menu-items.index');
            Route::post('/', [\App\Http\Controllers\MenuItemController::class, 'store'])->name('menu-items.store');
            Route::put('/{menuItem}', [\App\Http\Controllers\MenuItemController::class, 'update'])->name('menu-items.update');
            Route::post('/{menuItem}/toggle-status', [\App\Http\Controllers\MenuItemController::class, 'toggleStatus'])->name('menu-items.toggle-status');
            Route::delete('/{menuItem}', [\App\Http\Controllers\MenuItemController::class, 'destroy'])->name('menu-items.destroy');
        });

        // Table routes
        Route::prefix('tables')->group(function () {
            Route::get('/', [\App\Http\Controllers\TableController::class, 'index'])->name('tables.index');
            Route::post('/', [\App\Http\Controllers\TableController::class, 'store'])->name('tables.store');
            Route::put('/{table}', [\App\Http\Controllers\TableController::class, 'update'])->name('tables.update');
            Route::post('/{table}/toggle-status', [\App\Http\Controllers\TableController::class, 'toggleStatus'])->name('tables.toggle-status');
            Route::post('/{table}/reserve', [\App\Http\Controllers\TableController::class, 'reserve'])->name('tables.reserve');
            Route::delete('/{table}', [\App\Http\Controllers\TableController::class, 'destroy'])->name('tables.destroy');
        });

        // User routes (for reservation dropdown)
        Route::get('/users', function (Request $request) {
            $users = \App\Models\User::where('role', 'customer')
                ->orderBy('name')
                ->get(['id', 'name', 'email']);
            
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'users' => $users
                ]);
            }
            
            return response()->json([
                'users' => $users
            ]);
        })->name('users.index');
    });
    
    // Customer routes
    Route::middleware('role:customer')->group(function () {
        Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');
        Route::get('/checkout', [CartController::class, 'showCheckout'])->name('checkout');
    });
});