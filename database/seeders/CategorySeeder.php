<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan Korea', 'icon' => '🍜'],
            ['name' => 'Minuman Korea', 'icon' => '🥤'],
            ['name' => 'BBQ & Grill', 'icon' => '🍖'],
            ['name' => 'Set Menu', 'icon' => '🍱'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
