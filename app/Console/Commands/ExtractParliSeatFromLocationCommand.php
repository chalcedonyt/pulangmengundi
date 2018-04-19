<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ExtractParliSeatFromLocationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adhoc:extract-parli-seat';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract parliament seat from location';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        \App\Models\Location::all()
        ->each(function ($l) {
           $seat_name = preg_replace('( \/.+)',  '', $l->name);
           $seat = \App\Models\ParliSeat::where('seat_name', '=', $seat_name)->first();
           if ($seat) {
               $l->parli_seat_id = $seat->getKey();
               $l->parli_seat_name = $seat_name;
               $l->save();
           }
        });
    }
}
