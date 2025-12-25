<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        // Create Customer User
        User::factory()->create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        $this->call([
            CategorySeeder::class,
            MenuItemSeeder::class,
        ]);
        
        // Seed transactions after menu items are created
        $this->call([
            TransactionSeeder::class,
        ]);
    }
}
