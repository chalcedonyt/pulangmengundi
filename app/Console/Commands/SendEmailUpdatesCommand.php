<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;

class SendEmailUpdatesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:match-updates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends information to drivers and riders about their updates';

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
        \App\Models\User::with(
            'need',
            'need.user',
            'need.fromLocation.locationState',
            'need.pollLocation.locationState',
            'offers',
            'offers.user',
            'offers.fromLocation.locationState',
            'offers.toLocation.locationState'
        )
        ->orderBy('id')->chunk(50, function ($users) {
            foreach ($users as $user) {
                $matched_offers = collect([]);
                if ($user->need) {
                    $matched_offers = (new MatchGateway)->matchNeed($user->need);
                }

                $matched_needs = collect([]);
                if ($user->offers) {
                    foreach ($user->offers as $offer) {
                        $needs = (new MatchGateway)->matchOffer($offer);
                        if ($needs->count()) {
                            $matched_needs = $matched_needs->concat($needs);
                        }
                    }
                }
                if ($matched_needs->count() || $matched_offers->count()) {
                    $job = new SendEmailMatchUpdateJob($user, $matched_offers, $matched_needs);
                }
            }
        });
    }
}
