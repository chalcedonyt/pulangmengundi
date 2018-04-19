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
            $djk_route = $offer->getDjkRoute();
            if ($djk_route) {
                $needs = \App\Models\CarpoolNeed::with('fromLocation', 'pollLocation')
                ->where(\DB::raw("'".$djk_route->route_csv."'"), 'LIKE', \DB::raw("CONCAT('%', parli_seat_id_string, '%')"))
                ->where('parli_seat_id_string', '<>', '')
                ->get();
                if ($needs) {
                    foreach ($needs as $need) {
                        $msg = sprintf('Offer %d (%s, %s) matched need %d (%s, %s)',
                            $offer->getKey(),
                            $offer->fromLocation->parli_seat_name,
                            $offer->toLocation->parli_seat_name,
                            $need->getKey(),
                            $need->fromLocation->parli_seat_name,
                            $need->pollLocation->parli_seat_name
                        );
                        $this->info($msg);
                    }
                }
            }
        });
    }
}
