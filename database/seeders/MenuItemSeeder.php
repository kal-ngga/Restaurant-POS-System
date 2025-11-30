<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $makananKorea = Category::where('name', 'Makanan Korea')->first();
        $minumanKorea = Category::where('name', 'Minuman Korea')->first();

        $menuItems = [
            [
                'category_id' => $makananKorea->id,
                'title' => 'Kimchi Jjigae',
                'image' => 'https://images.unsplash.com/photo-1604908177522-402fa5c9ecdf?w=400&h=250&fit=crop',
                'badge' => 'New Arrival',
                'price' => 45000,
                'unit' => '/ mangkuk',
            ],
            [
                'category_id' => $makananKorea->id,
                'title' => 'Korean BBQ Beef',
                'image' => 'https://images.unsplash.com/photo-1601315379730-94f56b3d2fa5?w=400&h=250&fit=crop',
                'badge' => 'Best Seller',
                'price' => 85000,
                'unit' => '/ porsi',
            ],
            [
                'category_id' => $minumanKorea->id,
                'title' => 'Banana Milk',
                'image' => 'https://images.unsplash.com/photo-1588167100290-8cf4e9b6c3c0?w=400&h=250&fit=crop',
                'badge' => 'New Arrival',
                'price' => 18000,
                'unit' => '/ botol',
            ],
            [
                'category_id' => $makananKorea->id,
                'title' => 'Tteokbokki',
                'image' => 'https://images.unsplash.com/photo-1575932444877-5106f8a12c1c?w=400&h=250&fit=crop',
                'badge' => 'Best Seller',
                'price' => 30000,
                'unit' => '/ porsi',
            ],
            [
                'category_id' => $makananKorea->id,
                'title' => 'Korean Fried Chicken',
                'image' => 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=250&fit=crop',
                'badge' => 'New Arrival',
                'price' => 55000,
                'unit' => '/ porsi',
            ],
            [
                'category_id' => $makananKorea->id,
                'title' => 'Bibimbap',
                'image' => 'https://images.unsplash.com/photo-1571817017418-7f9b0f4c53d3?w=400&h=250&fit=crop',
                'badge' => 'Best Seller',
                'price' => 50000,
                'unit' => '/ mangkuk',
            ],
            [
                'category_id' => $makananKorea->id,
                'title' => 'Jajangmyeon',
                'image' => 'https://images.unsplash.com/photo-1580654499174-ea47efb93f52?w=400&h=250&fit=crop',
                'badge' => 'New Arrival',
                'price' => 40000,
                'unit' => '/ mangkuk',
            ],
            [
                'category_id' => $minumanKorea->id,
                'title' => 'Korean Strawberry Milk',
                'image' => 'https://images.unsplash.com/photo-1617189265343-6fc625dbfc68?w=400&h=250&fit=crop',
                'badge' => 'Best Seller',
                'price' => 20000,
                'unit' => '/ botol',
            ],
        ];

        foreach ($menuItems as $item) {
            MenuItem::create($item);
        }
    }
}
