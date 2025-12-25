<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Return aggregated dashboard metrics for today and recent transactions.
     */
    public function metrics(Request $request)
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        // Total revenue today (sum of orders.total_amount for orders created today)
        $totalRevenue = DB::table('orders')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->where('payment_status', 'paid')
            ->sum('total_amount') ?? 0;

        // Number of transactions (orders) today
        $transactionsCount = DB::table('orders')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->where('payment_status', 'paid')
            ->count();

        $avgPerTxn = $transactionsCount > 0 ? ($totalRevenue / $transactionsCount) : 0;

        // Top products (by quantity) in last 7 days
        $topProducts = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', now()->subDays(7))
            ->where('orders.payment_status', 'paid')
            ->groupBy('order_items.menu_item_id', 'menu_items.id', 'menu_items.title')
            ->select('menu_items.id', 'menu_items.title', DB::raw('SUM(order_items.quantity) as sold'))
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        // Recent transactions (latest 10 orders with user and total)
        $recent = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', 'paid')
            ->select(
                'orders.id as order_id',
                'orders.order_number',
                'orders.created_at as created_at',
                'users.id as user_id',
                'users.name as user_name',
                'orders.total_amount as total',
                DB::raw('COUNT(order_items.id) as items_count')
            )
            ->groupBy('orders.id', 'orders.order_number', 'users.id', 'users.name', 'orders.created_at', 'orders.total_amount')
            ->orderByDesc('orders.created_at')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'order_id' => $item->order_id,
                    'order_number' => $item->order_number,
                    'created_at' => $item->created_at,
                    'user_id' => $item->user_id,
                    'user_name' => $item->user_name,
                    'total' => (float) $item->total,
                    'items_count' => (int) $item->items_count,
                ];
            });

        // Get month and year from request, default to current month
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        // Ensure month and year are valid integers
        $month = (int) $month;
        $year = (int) $year;
        
        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }
        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }
        
        // Create start and end dates for the selected month
        $startDate = now()->setYear($year)->setMonth($month)->setDay(1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();
        
        // Previous month for comparison
        $prevStartDate = $startDate->copy()->subMonth()->startOfDay();
        $prevEndDate = $prevStartDate->copy()->endOfMonth()->endOfDay();

        // Monthly revenue data for chart (all days in selected month)
        $monthlyData = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                // Ensure date is in YYYY-MM-DD format
                $date = is_string($item->date) ? $item->date : $item->date->format('Y-m-d');
                return [
                    'date' => $date,
                    'revenue' => (float) $item->revenue
                ];
            });

        // Previous month data for comparison
        $previousMonthData = DB::table('orders')
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                // Ensure date is in YYYY-MM-DD format
                $date = is_string($item->date) ? $item->date : $item->date->format('Y-m-d');
                return [
                    'date' => $date,
                    'revenue' => (float) $item->revenue
                ];
            });

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'transactions_count' => (int) $transactionsCount,
            'avg_per_txn' => (float) $avgPerTxn,
            'top_products' => $topProducts,
            'recent_transactions' => $recent,
            'monthly_data' => $monthlyData,
            'previous_month_data' => $previousMonthData,
            'selected_month' => (int) $month,
            'selected_year' => (int) $year,
        ]);
    }
}
