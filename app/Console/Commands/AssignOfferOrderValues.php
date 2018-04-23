<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CarpoolOffer;

class AssignOfferOrderValues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adhoc:assign-offer-order-values';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Searches all outstanding offer and sets the offer-order flag, to determine display consolidation';

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
        $user_ids = \DB::table('offer_carpool')
        ->select('user_id')
        ->where('hidden', 0)
        ->where('fulfilled', 0)
        ->where('deleted_at', NULL)
        ->groupBy('user_id')
        ->get()
        ->pluck('user_id')
        ->each( function ($user_id) {
            $offers = CarpoolOffer::where('user_id', '=', $user_id)->orderBy('leave_at', 'ASC')->get();
            if ($offers->count() == 1) {
                // $this->info(sprintf("User %d has only one offer", $user_id));
                $offer = $offers->first();
                $offer->offer_order = 1;
                $offer->save();
            } else if ($offers->count() > 2) {
                $this->error(sprintf("User %d has more than one offer", $user_id));
                return;
            } else {

                $from_offer = $offers->get(0);
                $to_offer = $offers->get(1);
                if ($from_offer->location_id_from == $to_offer->location_id_from) {
                    $this->error(sprintf("The to and from location for user %d are the same", $user_id));
                    return;
                }
                $from_offer->offer_order = 1;
                $from_offer->save();

                $to_offer->offer_order = 2;
                $to_offer->save();
                // $this->info(sprintf("User %d offer orders assigned", $user_id));
            }
        });
    }
}
