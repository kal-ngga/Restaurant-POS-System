<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing tables to ensure clean state
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');

        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Create users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('role')->default('customer');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // Insert users data
        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'customer',
                'email_verified_at' => '2025-11-30 01:16:52',
                'password' => '$2y$12$l7x1k/5Ari.wC2ZdMT5eiOZq/z46bwkGq9oYPrWMLFN8YTcQaib6a',
                'remember_token' => 'm27AjTshbF',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 2,
                'name' => 'kalingga@gmail.com',
                'email' => 'kalingga@gmail.com',
                'role' => 'customer',
                'email_verified_at' => null,
                'password' => '$2y$12$/B79q7XoxWp3NqWOpV89b.XmwTlR0VRZS60CFskk1v.YHFbPauleC',
                'remember_token' => null,
                'created_at' => '2025-11-30 01:23:48',
                'updated_at' => '2025-11-30 01:23:48',
            ],
            [
                'id' => 3,
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'email_verified_at' => '2025-11-30 01:42:01',
                'password' => '$2y$12$wOYkx7O15ylSc7yjWqTKMeqQxGhIn75id3WLQGjCSFUwaJAjLng4W',
                'remember_token' => 'J6cF2fQDWECzqOgAzZXU1Od5umoi2FLMfxGkFdEwCazmGTYK1SWEQQm4k4ti',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 4,
                'name' => 'Customer',
                'email' => 'customer@example.com',
                'role' => 'customer',
                'email_verified_at' => '2025-11-30 01:42:02',
                'password' => '$2y$12$wOYkx7O15ylSc7yjWqTKMeqQxGhIn75id3WLQGjCSFUwaJAjLng4W',
                'remember_token' => 'sq4pcJbpAi2cnuCcjIdB6kyh0X9wwcTTNvcEBO2MEMa5lpwJ3hFeQvSMEH2N',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
        ]);

        // Create categories table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // Insert categories data
        DB::table('categories')->insert([
            [
                'id' => 1,
                'name' => 'Makanan Korea',
                'icon' => '🍜',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 2,
                'name' => 'Minuman Korea',
                'icon' => '🥤',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 3,
                'name' => 'BBQ & Grill',
                'icon' => '🍖',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 4,
                'name' => 'Set Menu',
                'icon' => '🍱',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
        ]);

        // Create menu_items table
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('title');
            $table->text('image');
            $table->string('badge')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('unit');
            $table->timestamps();
        });

        // Insert menu items data
        DB::table('menu_items')->insert([
            [
                'id' => 1,
                'category_id' => 1,
                'title' => 'Kimchi Jjigae',
                'image' => '/Images/Ramyeon.png',
                'badge' => 'New Arrival',
                'price' => 45000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 2,
                'category_id' => 1,
                'title' => 'Korean BBQ Beef',
                'image' => '/Images/Bulgogi.png',
                'badge' => 'Best Seller',
                'price' => 85000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 3,
                'category_id' => 2,
                'title' => 'Banana Milk',
                'image' => '/Images/Susu Pisang.png',
                'badge' => 'New Arrival',
                'price' => 18000.00,
                'unit' => '/ botol',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 4,
                'category_id' => 1,
                'title' => 'Tteokbokki',
                'image' => '/Images/Tteokpokki.png',
                'badge' => 'Best Seller',
                'price' => 30000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 5,
                'category_id' => 1,
                'title' => 'Korean Fried Chicken',
                'image' => '/Images/Yangnyeom.png',
                'badge' => 'New Arrival',
                'price' => 55000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 6,
                'category_id' => 1,
                'title' => 'Bibimbap',
                'image' => '/Images/Bibimbap.png',
                'badge' => 'Best Seller',
                'price' => 50000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 7,
                'category_id' => 1,
                'title' => 'Jajangmyeon',
                'image' => '/Images/Jjangmyeon.png',
                'badge' => 'New Arrival',
                'price' => 40000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 8,
                'category_id' => 2,
                'title' => 'Korean Strawberry Milk',
                'image' => '/Images/Hwachae.png',
                'badge' => 'Best Seller',
                'price' => 20000.00,
                'unit' => '/ botol',
                'created_at' => '2025-11-30 01:16:52',
                'updated_at' => '2025-11-30 01:16:52',
            ],
            [
                'id' => 9,
                'category_id' => 1,
                'title' => 'Kimchi Jjigae',
                'image' => '/Images/Ramyeon.png',
                'badge' => 'New Arrival',
                'price' => 45000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 10,
                'category_id' => 1,
                'title' => 'Korean BBQ Beef',
                'image' => '/Images/Bulgogi.png',
                'badge' => 'Best Seller',
                'price' => 85000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 11,
                'category_id' => 2,
                'title' => 'Banana Milk',
                'image' => '/Images/Susu Pisang.png',
                'badge' => 'New Arrival',
                'price' => 18000.00,
                'unit' => '/ botol',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 12,
                'category_id' => 1,
                'title' => 'Tteokbokki',
                'image' => '/Images/Tteokpokki.png',
                'badge' => 'Best Seller',
                'price' => 30000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 13,
                'category_id' => 1,
                'title' => 'Korean Fried Chicken',
                'image' => '/Images/Yangnyeom.png',
                'badge' => 'New Arrival',
                'price' => 55000.00,
                'unit' => '/ porsi',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 14,
                'category_id' => 1,
                'title' => 'Bibimbap',
                'image' => '/Images/Bibimbap.png',
                'badge' => 'Best Seller',
                'price' => 50000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 15,
                'category_id' => 1,
                'title' => 'Jajangmyeon',
                'image' => '/Images/Jjangmyeon.png',
                'badge' => 'New Arrival',
                'price' => 40000.00,
                'unit' => '/ mangkuk',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
            [
                'id' => 16,
                'category_id' => 2,
                'title' => 'Korean Strawberry Milk',
                'image' => '/Images/Hwachae.png',
                'badge' => 'Best Seller',
                'price' => 20000.00,
                'unit' => '/ botol',
                'created_at' => '2025-11-30 01:42:02',
                'updated_at' => '2025-11-30 01:42:02',
            ],
        ]);

        // Create carts table
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Create cart_items table
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Create sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Create password_reset_tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
