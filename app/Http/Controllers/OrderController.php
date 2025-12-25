<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'table', 'items.menuItem'])
            ->orderByDesc('created_at');

        // Filter by payment status (only if not empty)
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by order status (only if not empty)
        if ($request->has('order_status') && $request->order_status !== '') {
            $query->where('order_status', $request->order_status);
        }

        // Search by order number or user name (only if not empty)
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by month and year using created_at column
        if ($request->has('month') && $request->has('year') && $request->month && $request->year) {
            $month = (int) $request->month;
            $year = (int) $request->year;
            $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load(['user', 'table', 'items.menuItem']);
        return response()->json($order);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'nullable|in:pending,processing,ready,served,completed',
            'payment_status' => 'nullable|in:pending,paid,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order berhasil diperbarui',
            'order' => $order->load(['user', 'table', 'items.menuItem']),
        ]);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        try {
            DB::beginTransaction();
            
            // Delete order items first (cascade should handle this, but being explicit)
            $order->items()->delete();
            
            // Delete the order
            $order->delete();
            
            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order item quantity
     */
    public function updateItem(Request $request, Order $order, OrderItem $orderItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($orderItem->order_id !== $order->id) {
            return response()->json([
                'message' => 'Order item tidak ditemukan'
            ], 404);
        }

        $orderItem->quantity = $validated['quantity'];
        $orderItem->subtotal = $orderItem->quantity * $orderItem->unit_price;
        $orderItem->save();

        // Recalculate order total
        $order->total_amount = $order->items()->sum(DB::raw('quantity * unit_price'));
        $order->save();

        return response()->json([
            'message' => 'Item berhasil diperbarui',
            'order' => $order->load(['user', 'table', 'items.menuItem']),
        ]);
    }

    /**
     * Delete order item
     */
    public function deleteItem(Order $order, OrderItem $orderItem)
    {
        if ($orderItem->order_id !== $order->id) {
            return response()->json([
                'message' => 'Order item tidak ditemukan'
            ], 404);
        }

        $orderItem->delete();

        // Recalculate order total
        $order->total_amount = $order->items()->sum(DB::raw('quantity * unit_price'));
        $order->save();

        return response()->json([
            'message' => 'Item berhasil dihapus',
            'order' => $order->load(['user', 'table', 'items.menuItem']),
        ]);
    }

    /**
     * Get summary statistics for transactions page
     * Returns best selling items and favorite items
     */
    public function getSummary(Request $request)
    {
        // Get filter parameters
        $month = $request->input('month');
        $year = $request->input('year');
        $paymentStatus = $request->input('payment_status', 'paid');

        $query = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.payment_status', $paymentStatus);

        // Filter by month and year if provided
        if ($month && $year) {
            $startDate = now()->setYear($year)->setMonth($month)->setDay(1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();
            $query->whereBetween('orders.created_at', [$startDate, $endDate]);
        }

        // Best selling items (by quantity)
        $bestSelling = $query
            ->select(
                'menu_items.id',
                'menu_items.title',
                'menu_items.image',
                'menu_items.price',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.title', 'menu_items.image', 'menu_items.price')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // Favorite items (by number of unique orders)
        $favorites = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.payment_status', $paymentStatus);

        if ($month && $year) {
            $startDate = now()->setYear($year)->setMonth($month)->setDay(1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();
            $favorites->whereBetween('orders.created_at', [$startDate, $endDate]);
        }

        $favorites = $favorites
            ->select(
                'menu_items.id',
                'menu_items.title',
                'menu_items.image',
                'menu_items.price',
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('SUM(order_items.quantity) as total_sold')
            )
            ->groupBy('menu_items.id', 'menu_items.title', 'menu_items.image', 'menu_items.price')
            ->orderByDesc('order_count')
            ->limit(5)
            ->get();

        return response()->json([
            'best_selling' => $bestSelling,
            'favorites' => $favorites
        ]);
    }
}

