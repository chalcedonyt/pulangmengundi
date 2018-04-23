<?php

use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $path = __DIR__.'/artifacts/states.sql';
        DB::unprepared(file_get_contents($path));
        $this->command->info('locations table seeded!');
    }
}
