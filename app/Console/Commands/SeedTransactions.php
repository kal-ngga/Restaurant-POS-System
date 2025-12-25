<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-transactions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed transactions across multiple months with multiple items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding transactions...');
        
        $this->call('db:seed', [
            '--class' => 'TransactionSeeder'
        ]);
        
        $this->info('Transactions seeded successfully!');
    }
}
