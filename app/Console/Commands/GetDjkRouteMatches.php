<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GetDjkRouteMatches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adhoc:get-djk-matches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

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
        \App\Models\CarpoolOffer::with('fromLocation', 'toLocation')->get()
        ->each(function ($offer) {
            $msg = sprintf('Checking offer %d (%s, %s) for djk route',
                $offer->getKey(),
                $offer->fromLocation->parli_seat_name,
                $offer->toLocation->parli_seat_name
            );
            // $this->info($msg);
            $matches = $offer->getDjkRouteMatches();
            if ($matches)
                $this->info(sprintf("Found %d matches for route %d", count(json_decode($matches, true)), $offer->getKey()));
        });
    }
}
