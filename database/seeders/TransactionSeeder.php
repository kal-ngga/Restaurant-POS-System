<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates transactions across multiple months (last 6 months)
     * Each month has multiple transactions (5-15 per month)
     * Each transaction has 2-5 items with varying quantities
     */
    public function run(): void
    {
        // Get all menu items and users
        $menuItems = MenuItem::all();
        $users = User::where('role', 'customer')->get();
        
        if ($menuItems->isEmpty()) {
            $this->command->warn('No menu items found. Please seed menu items first.');
            return;
        }
        
        if ($users->isEmpty()) {
            $this->command->warn('No customer users found. Creating a test customer...');
            $users = collect([User::factory()->create([
                'name' => 'Test Customer',
                'email' => 'testcustomer@example.com',
                'role' => 'customer',
            ])]);
        }

        // Generate transactions for the last 6 months
        $months = 6;
        $currentDate = Carbon::now();
        
        $orderCount = 0;
        $totalOrders = 0;

        for ($monthOffset = 0; $monthOffset < $months; $monthOffset++) {
            $targetMonth = $currentDate->copy()->subMonths($monthOffset);
            $daysInMonth = $targetMonth->daysInMonth;
            
            // Generate 5-15 transactions per month
            $transactionsPerMonth = rand(8, 15);
            
            for ($i = 0; $i < $transactionsPerMonth; $i++) {
                // Random day in the month
                $day = rand(1, $daysInMonth);
                
                // Random time during business hours (10:00 - 22:00)
                $hour = rand(10, 21);
                $minute = rand(0, 59);
                
                $orderDate = $targetMonth->copy()
                    ->setDay($day)
                    ->setHour($hour)
                    ->setMinute($minute)
                    ->setSecond(rand(0, 59));
                
                // Random user
                $user = $users->random();
                
                // Generate 2-5 items per order
                $itemCount = rand(2, 5);
                $selectedItems = $menuItems->random(min($itemCount, $menuItems->count()));
                
                // Calculate total amount
                $totalAmount = 0;
                $orderItems = [];
                
                foreach ($selectedItems as $menuItem) {
                    $quantity = rand(1, 4); // 1-4 items per menu item
                    $unitPrice = $menuItem->price;
                    $subtotal = $quantity * $unitPrice;
                    $totalAmount += $subtotal;
                    
                    $orderItems[] = [
                        'menu_item_id' => $menuItem->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $subtotal,
                    ];
                }
                
                // Generate unique order number for the specific date
                $datePrefix = $orderDate->format('Ymd');
                $existingOrdersOnDate = Order::whereDate('created_at', $orderDate->toDateString())->count();
                $orderNumber = 'ORD-' . $datePrefix . '-' . str_pad($existingOrdersOnDate + 1, 4, '0', STR_PAD_LEFT);
                
                // Create order
                $order = Order::create([
                    'user_id' => $user->id,
                    'table_id' => null,
                    'order_number' => $orderNumber,
                    'order_type' => collect(['dine-in', 'takeaway', 'online'])->random(),
                    'total_amount' => $totalAmount,
                    'payment_status' => 'paid', // All seeded orders are paid
                    'order_status' => collect(['completed', 'served', 'ready'])->random(),
                    'notes' => rand(0, 10) > 7 ? 'Special request: ' . collect(['No spice', 'Extra sauce', 'Fast service', 'Take away'])->random() : null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
                
                // Create order items
                foreach ($orderItems as $itemData) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_item_id' => $itemData['menu_item_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'subtotal' => $itemData['subtotal'],
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }
                
                $orderCount++;
                $totalOrders++;
            }
            
            $this->command->info("Created {$transactionsPerMonth} transactions for " . $targetMonth->format('F Y'));
        }
        
        $this->command->info("Total transactions created: {$totalOrders}");
    }
}
