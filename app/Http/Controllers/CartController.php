<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function showCheckout()
    {
        $cart = auth()->user()->cart ?? Cart::create(['user_id' => auth()->id()]);
        $items = $cart->items()->with('menuItem')->get();

        return Inertia::render('Checkout', [
            'cart' => [
                'items' => $items,
                'total' => $items->sum(fn($item) => $item->quantity * $item->price),
                'count' => $items->sum('quantity'),
            ],
        ]);
    }

    public function index()
    {
        $cart = auth()->user()->cart ?? Cart::create(['user_id' => auth()->id()]);
        
        $items = $cart->items()->with('menuItem')->get();

        return response()->json([
            'items' => $items,
            'total' => $items->sum(fn($item) => $item->quantity * $item->price),
            'count' => $items->sum('quantity'),
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = auth()->user()->cart ?? Cart::create(['user_id' => auth()->id()]);
        $menuItem = MenuItem::find($validated['menu_item_id']);

        $cartItem = $cart->items()->where('menu_item_id', $validated['menu_item_id'])->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $validated['quantity']);
        } else {
            $cart->items()->create([
                'menu_item_id' => $validated['menu_item_id'],
                'quantity' => $validated['quantity'],
                'price' => $menuItem->price,
            ]);
        }

        return $this->index();
    }

    public function update(Request $request, CartItem $cartItem)
    {
        // Ensure the cart item belongs to the authenticated user
        $cart = auth()->user()->cart;
        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem->update($validated);

        return $this->index();
    }

    public function remove(CartItem $cartItem)
    {
        // Ensure the cart item belongs to the authenticated user
        $cart = auth()->user()->cart;
        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $cartItem->delete();

        return $this->index();
    }

    public function clear()
    {
        $cart = auth()->user()->cart;
        
        if ($cart) {
            $cart->items()->delete();
        }

        return $this->index();
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'order_type' => 'nullable|in:dine-in,takeaway,online',
            'table_id' => 'nullable|exists:tables,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $cart = auth()->user()->cart;

        if (!$cart || $cart->items()->count() === 0) {
            return response()->json([
                'message' => 'Keranjang kosong'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Calculate total
            $totalAmount = $cart->items()->sum(DB::raw('quantity * price'));

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'table_id' => $validated['table_id'] ?? null,
                'order_type' => $validated['order_type'] ?? 'dine-in',
                'total_amount' => $totalAmount,
                'payment_status' => 'paid',
                'order_status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items from cart items
            foreach ($cart->items as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price,
                    'subtotal' => $cartItem->quantity * $cartItem->price,
                ]);
            }

            // Clear cart after checkout
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'message' => 'Checkout berhasil',
                'order' => $order->load('items.menuItem'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage()
            ], 500);
        }
    }
}

